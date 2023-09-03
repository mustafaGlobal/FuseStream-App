import * as mediasoup from 'mediasoup-client';
import { types as mediasoupTypes } from 'mediasoup-client';
import { Peer, WebSocketTransport } from '@/lib/ws-room-client';
import { getDeviceInfo } from './deviceInfo';
import type { joinRequest } from '../ws-room-client/types';

interface VideoClientConstructor {
  roomId: string;
  peerId: string;
  mediasoupDevice: mediasoupTypes.Device;
  peer: Peer;
  displayName: string;
}

export default class VideoClient {
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
    this.mediasoupDevice = arg.mediasoupDevice;
    this.peer = arg.peer;
    this.displayName = arg.displayName;
    this.device = getDeviceInfo();

    this.peer.on('open', async () => {
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
  }

  async join() {
    const joinReq: joinRequest = {
      displayName: this.displayName,
      device: this.device,
      rtpCapabilites: this.mediasoupDevice.rtpCapabilities
    };

    await this.peer.request('join', joinReq);
  }

  private handleNotifications(notification: Notification) {
    console.log('Notification: %o', notification);
  }

  private handleRequests(request: Request, accept: Function, reject: Function) {
    console.log('Request: %o', request);
  }
}
