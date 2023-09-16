import * as mediasoup from 'mediasoup-client';
import { types as mediasoupTypes } from 'mediasoup-client';
import { Peer, WebSocketTransport } from '@/lib/ws-room-client';
import { getDeviceInfo, type Device } from './deviceInfo';
import type {
  CloseProducerRequest,
  ConnectWebRtcTransportRequest,
  ConsumerClosedNotification,
  ConsumerLayersChangedNotification,
  ConsumerPausedNotification,
  ConsumerResumedNotification,
  CreateWebRtcTransportRequest,
  CreateWebRtcTransportResponse,
  GetRouterRtpCapabilitiesResponse,
  JoinRequest,
  JoinResponse,
  NewConsumerRequest,
  NewPeerNotification,
  Notification,
  PeerClosedNotification,
  ProduceRequest,
  ProduceResponse,
  Request,
  ResponseData
} from '../ws-room-client/types';
import { EventEmitter } from 'events';
import { createLogger } from '@/lib/logger';

interface VideoClientCreator {
  url: string;
  roomId: string;
  peerId: string;
  displayName: string;
  svcEnabled: boolean;
  numOfSimulcastStreams: number;
}

interface VideoClientConstructor {
  roomId: string;
  peerId: string;
  mediasoupDevice: mediasoupTypes.Device;
  peer: Peer;
  displayName: string;
  svcEnabled: boolean;
  numOfSimulcastStreams: number;
}

const logger = createLogger('videoClient');

export default class VideoClient extends EventEmitter {
  private closed = false;
  private device: Device;
  private mediasoupDevice: mediasoupTypes.Device;
  private peer: Peer;
  private displayName: string;

  private svcEnabled = false;
  private numOfSimulcastStreams = 0;

  private sendTransport: mediasoupTypes.Transport | null = null;
  private recvTransport: mediasoupTypes.Transport | null = null;

  private producer: mediasoupTypes.Producer | undefined | null = undefined;
  private consumers: Map<string, mediasoupTypes.Consumer> = new Map();

  static async create({
    url,
    roomId,
    peerId,
    displayName,
    svcEnabled,
    numOfSimulcastStreams
  }: VideoClientCreator) {
    const transport = await WebSocketTransport.create(
      url + '?roomId=' + roomId + '&peerId=' + peerId
    );
    const peer = new Peer(transport, peerId);

    const mediasoupDevice = new mediasoup.Device();
    const routerRtpCapabilities: mediasoupTypes.RtpCapabilities = (await peer.request(
      'getRouterRtpCapabilities'
    )) as GetRouterRtpCapabilitiesResponse;

    await mediasoupDevice.load({ routerRtpCapabilities });

    if (!mediasoupDevice.canProduce('video')) {
      console.error('cannot produce video');
      throw 'cant produce video';
    }

    return new VideoClient({
      roomId,
      peerId,
      mediasoupDevice,
      peer,
      displayName,
      svcEnabled,
      numOfSimulcastStreams
    });
  }

  constructor(arg: VideoClientConstructor) {
    super();
    this.mediasoupDevice = arg.mediasoupDevice;
    this.peer = arg.peer;
    this.displayName = arg.displayName;
    this.svcEnabled = arg.svcEnabled;
    this.numOfSimulcastStreams = arg.numOfSimulcastStreams;
    this.device = getDeviceInfo();

    this.peer.on('open', async () => {
      logger.info('joining room...');
      await this.join();
    });

    this.peer.addListener('close', () => {
      this.close();
    });

    this.peer.addListener('notification', (notification: Notification) => {
      this.handleNotifications(notification);
    });

    this.peer.addListener(
      'request',
      (
        request: Request,
        accept: (data?: ResponseData) => void,
        reject: (reason: string) => void
      ) => {
        this.handleRequests(request, accept, reject);
      }
    );
  }

  close() {
    if (this.closed) {
      return;
    }

    this.closed = true;
    this.peer.close();
    if (this.sendTransport) {
      this.sendTransport.close();
      this.sendTransport = null;
    }
    if (this.recvTransport) {
      this.recvTransport.close();
      this.recvTransport = null;
    }

    this.emit('close');
  }

  private async join() {
    try {
      const produceTransportReq: CreateWebRtcTransportRequest = {
        forceTcp: false,
        producing: true,
        consuming: false
      };

      const producerTransportInfo = (await this.peer.request(
        'createWebRtcTransport',
        produceTransportReq
      )) as CreateWebRtcTransportResponse;

      this.sendTransport = this.mediasoupDevice.createSendTransport({
        id: producerTransportInfo.id,
        iceParameters: producerTransportInfo.iceParameters,
        iceCandidates: producerTransportInfo.iceCandidates,
        dtlsParameters: {
          ...producerTransportInfo.dtlsParamters,
          role: 'auto'
        },
        iceServers: []
      });

      this.sendTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        if (this.sendTransport) {
          const req: ConnectWebRtcTransportRequest = {
            transportId: this.sendTransport.id,
            dtlsParameters
          };

          this.peer.request('connectWebRtcTransport', req).then(callback).catch(errback);
        }
      });

      this.sendTransport.on(
        'produce',
        async ({ kind, rtpParameters, appData }, callback, errback) => {
          if (this.sendTransport) {
            const req: ProduceRequest = {
              transportId: this.sendTransport?.id,
              kind: kind,
              rtpParameters: rtpParameters,
              appData: appData
            };

            try {
              const resp = (await this.peer.request('produce', req)) as ProduceResponse;

              callback({ id: resp.producerId });
            } catch (error) {
              errback(error as Error);
            }
          }
        }
      );

      const consumerTransportReq: CreateWebRtcTransportRequest = {
        forceTcp: false,
        producing: false,
        consuming: true
      };

      const consumeTransportInfo = (await this.peer.request(
        'createWebRtcTransport',
        consumerTransportReq
      )) as CreateWebRtcTransportResponse;

      this.recvTransport = this.mediasoupDevice.createRecvTransport({
        id: consumeTransportInfo.id,
        iceParameters: consumeTransportInfo.iceParameters,
        iceCandidates: consumeTransportInfo.iceCandidates,
        dtlsParameters: {
          ...consumeTransportInfo.dtlsParamters,
          role: 'auto'
        },
        iceServers: []
      });

      this.recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
        if (this.recvTransport) {
          const req: ConnectWebRtcTransportRequest = {
            transportId: this.recvTransport?.id,
            dtlsParameters: dtlsParameters
          };
          this.peer.request('connectWebRtcTransport', req).then(callback).catch(errback);
        }
      });

      const joinReq: JoinRequest = {
        displayName: this.displayName,
        device: this.device,
        rtpCapabilites: this.mediasoupDevice.rtpCapabilities
      };

      const resp = (await this.peer.request('join', joinReq)) as JoinResponse;

      this.emit('join', resp.peers);
    } catch (error) {
      logger.error('join() failed: %o', error);
    }
  }

  public async enableVideo() {
    logger.debug('enableVideo()');

    if (this.producer) {
      return;
    }

    if (!this.mediasoupDevice.canProduce('video')) {
      logger.error('enableVideo() | can not produce video');
      return;
    }

    this.emit('videoInProgress', true);

    let track: MediaStreamTrack | null = null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          frameRate: { ideal: 15, max: 30 },
          facingMode: 'user'
        },
        audio: false
      });

      track = stream.getVideoTracks()[0];

      const codecOptions: mediasoupTypes.ProducerCodecOptions = {
        videoGoogleStartBitrate: 1000
      };

      let encodings: mediasoupTypes.RtpEncodingParameters[] = [];
      if (this.svcEnabled) {
        encodings = [
          {
            scaleResolutionDownBy: 1,
            maxBitrate: 5000000,
            scalabilityMode: 'L1T3'
          }
        ];

        if (this.numOfSimulcastStreams > 1) {
          encodings.unshift({
            scaleResolutionDownBy: 2,
            maxBitrate: 1000000,
            scalabilityMode: 'L1T3'
          });
        }

        if (this.numOfSimulcastStreams > 2) {
          encodings.unshift({
            scaleResolutionDownBy: 4,
            maxBitrate: 500000,
            scalabilityMode: 'L1T3'
          });
        }
      }

      this.producer = await this.sendTransport?.produce({ track, encodings, codecOptions });

      this.emit('addProducer', {
        id: this.producer?.id,
        paused: this.producer?.paused,
        track: this.producer?.track,
        rtpParamaters: this.producer?.rtpParameters,
        codec: this.producer?.rtpParameters.codecs[0].mimeType.split('/')[1]
      });

      this.producer?.on('transportclose', () => {
        this.producer = null;
      });

      this.producer?.on('trackended', () => {
        this.disableVideo().catch();
      });
    } catch (error) {
      logger.error('enableVideo() | failed: %o', error);

      track?.stop();
      this.emit('videoInProgress', false);
      return;
    }
  }

  public async disableVideo() {
    logger.debug('disableVideo() | producer: %o', this.producer);

    if (!this.producer) {
      return;
    }

    this.emit('videoInProgress', false);

    this.emit('removeProducer', {
      producerId: this.producer.id
    });

    const req: CloseProducerRequest = {
      producerId: this.producer.id
    };

    this.producer?.close();

    await this.peer.request('closeProducer', req);

    this.producer = null;
  }

  private handleNotifications(notification: Notification) {
    switch (notification.method) {
      case 'newPeer': {
        this.emit('newPeer', notification.data as NewPeerNotification);
        break;
      }

      case 'peerClosed': {
        this.emit('removePeer', notification.data as PeerClosedNotification);
        break;
      }

      case 'consumerClosed': {
        const { peerId, consumerId } = notification.data as ConsumerClosedNotification;
        logger.info(`Peer {${peerId}} consumer closed event for consumer {${consumerId}}`);
        break;
      }

      case 'consumerPaused': {
        const { peerId, consumerId } = notification.data as ConsumerPausedNotification;
        logger.info(`Peer {${peerId}} consumer paused event for consumer {${consumerId}}`);
        break;
      }

      case 'consumerResumed': {
        const { peerId, consumerId } = notification.data as ConsumerResumedNotification;
        logger.info(`Peer {${peerId}} consumer resumed event for consumer {${consumerId}}`);
        break;
      }

      case 'consumerLayersChanged': {
        const { peerId, consumerId } = notification.data as ConsumerLayersChangedNotification;
        logger.info(`Peer {${peerId}} consumer layers change event for consumer {${consumerId}}`);
        break;
      }

      default:
        logger.warn('unhandled notification recived: %o', notification);
        break;
    }
  }

  private handleRequests(
    request: Request,
    accept: (data?: ResponseData) => void,
    reject: (reason: string) => void
  ) {
    switch (request.method) {
      case 'newConsumer': {
        const consumer = request.data as NewConsumerRequest;
        logger.info('New consumer request, consumer: %o', consumer);
        accept();
        break;
      }

      default:
        logger.warn('unhandled request recived %o', request);
        reject('unhandled request');
        break;
    }
  }
}
