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
  private roomId: string;
  private peerId: string;
  private device: object;
  private mediasoupDevice: mediasoupTypes.Device;
  private peer: Peer;
  private displayName: string;
  private sendTransport: mediasoupTypes.Transport;
  private recvTransport: mediasoupTypes.Transport;
  private webcamProducer: mediasoupTypes.Producer;

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
    this.roomId = arg.roomId;
    this.peerId = arg.peerId;
    this.mediasoupDevice = arg.mediasoupDevice;
    this.peer = arg.peer;
    this.displayName = arg.displayName;
    this.device = getDeviceInfo();
    this.handleNotifications();
  }

  async join() {
    const response = await this.peer.request('join', {
      displayName: this.displayName,
      device: this.device,
      rtpCapabilites: this.mediasoupDevice.rtpCapabilities,
      sctpCapabilites: this.mediasoupDevice.sctpCapabilities
    });

    console.log('JoinRoom:');
    console.log(response);
  }

  private handleNotifications() {
    this.peer.addListener('notification', (notification: Notification) => {
      console.log('Notification: %o', notification);
    });
  }
}
