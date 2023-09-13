import * as mediasoup from 'mediasoup-client';
import { types as mediasoupTypes } from 'mediasoup-client';
import { Peer, WebSocketTransport } from '@/lib/ws-room-client';
import { getDeviceInfo } from './deviceInfo';
import type {
  consumerClosedNotification,
  consumerLayersChangedNotification,
  consumerPausedNotification,
  consumerResumedNotification,
  joinRequest,
  joinResponse,
  newConsumerRequest,
  newPeerNotification,
  Notification,
  peerClosedNotification,
  Request
} from '../ws-room-client/types';
import { EventEmitter } from 'events';
import { createLogger } from '@/lib/logger';

interface VideoClientConstructor {
  roomId: string;
  peerId: string;
  mediasoupDevice: mediasoupTypes.Device;
  peer: Peer;
  displayName: string;
}

const logger = createLogger('videoClient');

export default class VideoClient extends EventEmitter {
  private closed: boolean = false;
  private device: object;
  private mediasoupDevice: mediasoupTypes.Device;
  private peer: Peer;
  private displayName: string;

  private sendTransport: mediasoupTypes.Transport | null = null;
  private recvTransport: mediasoupTypes.Transport | null = null;

  private producer: mediasoupTypes.Producer | null = null;
  private consumers: Map<string, mediasoupTypes.Consumer> = new Map();

  static async create(url: string, roomId: string, peerId: string, displayName: string) {
    const transport = await WebSocketTransport.create(
      url + '?roomId=' + roomId + '&peerId=' + peerId
    );
    const peer = new Peer(transport);

    const mediasoupDevice = new mediasoup.Device();
    const routerRtpCapabilities: any = await peer.request('getRouterRtpCapabilities', {});
    await mediasoupDevice.load({ routerRtpCapabilities });

    return new VideoClient({ roomId, peerId, mediasoupDevice, peer, displayName });
  }

  constructor(arg: VideoClientConstructor) {
    super();
    this.mediasoupDevice = arg.mediasoupDevice;
    this.peer = arg.peer;
    this.displayName = arg.displayName;
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

    this.peer.addListener('request', (request: Request, accept: Function, reject: Function) => {
      this.handleRequests(request, accept, reject);
    });
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

  async join() {
    const joinReq: joinRequest = {
      displayName: this.displayName,
      device: this.device,
      rtpCapabilites: this.mediasoupDevice.rtpCapabilities
    };

    const resp: joinResponse = await this.peer.request('join', joinReq);

    this.emit('join', resp.peers);
  }

  private handleNotifications(notification: Notification) {
    switch (notification.method) {
      case 'newPeer': {
        const newPeerNotificationData: newPeerNotification = notification.data;
        this.emit('newPeer', newPeerNotificationData);
        break;
      }

      case 'peerClosed': {
        const peerClosedNotificationData: peerClosedNotification = notification.data;
        this.emit('removePeer', peerClosedNotificationData);
        break;
      }

      case 'consumerClosed': {
        const { peerId, consumerId }: consumerClosedNotification = notification.data;
        logger.info(`Peer {${peerId}} consumer closed event for consumer {${consumerId}}`);
        break;
      }

      case 'consumerPaused': {
        const { peerId, consumerId }: consumerPausedNotification = notification.data;
        logger.info(`Peer {${peerId}} consumer paused event for consumer {${consumerId}}`);
        break;
      }

      case 'consumerResumed': {
        const { peerId, consumerId }: consumerResumedNotification = notification.data;
        logger.info(`Peer {${peerId}} consumer resumed event for consumer {${consumerId}}`);
        break;
      }

      case 'consumerLayersChanged': {
        const { peerId, consumerId }: consumerLayersChangedNotification = notification.data;
        logger.info(`Peer {${peerId}} consumer layers change event for consumer {${consumerId}}`);
        break;
      }

      default:
        logger.warn('unhandled notification recived: %o', notification);
        break;
    }
  }

  private handleRequests(request: Request, accept: Function, reject: Function) {
    switch (request.method) {
      case 'newConsumer': {
        const consumer: newConsumerRequest = request.data;
        logger.info('New consumer request, consumer: %o', consumer);
        accept();
        break;
      }

      default:
        logger.warn('unhandled request recived %o', request);
        reject();
        break;
    }
  }
}
