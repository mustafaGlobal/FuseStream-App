import * as mediasoup from 'mediasoup-client';
import { types as mediasoupTypes } from 'mediasoup-client';
import { Peer, WebSocketTransport } from '@/lib/ws-room-client';
import { getDeviceInfo } from './deviceInfo';

interface VideoClientConstructor {
  roomId: string;
  peerId: string;
  mediasoupDevice: mediasoupTypes.Device;
  peer: Peer;
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

  static async create(url: string, roomId: string, peerId: string) {
    const transport = await WebSocketTransport.create(
      url + '?roomId=' + roomId + '&peerId=' + peerId
    );
    const peer = new Peer(transport);
    const mediasoupDevice = new mediasoup.Device();
    return new VideoClient({ roomId, peerId, mediasoupDevice, peer });
  }

  constructor(arg: VideoClientConstructor) {
    this.roomId = arg.roomId;
    this.peerId = arg.peerId;
    this.mediasoupDevice = arg.mediasoupDevice;
    this.peer = arg.peer;
    this.displayName = 'Anonymous';
    this.device = getDeviceInfo();
  }

  public async getRtpCapabilites() {
    const routerRtpCapabilities: any = await this.peer.request('getRouterRtpCapabilities', {});
    this.mediasoupDevice.load({ routerRtpCapabilities });
  }
}
