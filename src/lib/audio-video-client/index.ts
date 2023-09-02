import * as mediasoup from 'mediasoup-client';
import { types as mediasoupTypes } from 'mediasoup-client';
import { Peer, WebSocketTransport } from '@/lib/ws-room-client';
import { getDeviceInfo } from './deviceInfo';

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
    this.handleNotifications();
  }

  close() {
    if (this.closed) {
      return;
    }

    this.closed = true;
    this.peer.close();
    if (this.sendTransport) {
      this.sendTransport.close();
    }
    if (this.recvTransport) {
      this.recvTransport.close();
    }
  }

  async join() {
    await this.peer.request('join', {
      displayName: this.displayName,
      device: this.device,
      rtpCapabilites: this.mediasoupDevice.rtpCapabilities,
      sctpCapabilites: this.mediasoupDevice.sctpCapabilities
    });
  }

  private handleNotifications() {
    this.peer.addListener('notification', (notification: Notification) => {
      console.log('Notification: %o', notification);
    });
  }
}
