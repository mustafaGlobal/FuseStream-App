import * as mediasoup from 'mediasoup-client';
import { types as mediasoupTypes } from 'mediasoup-client';
import { Peer, WebSocketTransport } from '@/lib/ws-room-client';

interface RoomClientConstructor {
  roomId: string;
  peerId: string;
  device: mediasoupTypes.Device;
  peer: Peer;
  transport: WebSocketTransport;
}

export default class RoomClient {
  private roomId: string;
  private peerId: string;
  private device: mediasoupTypes.Device;
  private peer: Peer;
  private transport: WebSocketTransport;

  static async create(url: string, roomId: string, peerId: string) {
    const transport = await WebSocketTransport.create(
      url + '?roomId=' + roomId + '&peerId=' + peerId
    );
    const peer = new Peer(transport);
    const device = new mediasoup.Device();
    return new RoomClient({ roomId, peerId, device, peer, transport });
  }

  constructor(arg: RoomClientConstructor) {
    this.roomId = arg.roomId;
    this.peerId = arg.peerId;
    this.device = arg.device;
    this.peer = arg.peer;
    this.transport = arg.transport;
  }

  public async getRtpCapabilites() {
    const response: any = await this.peer.request('getRouterRtpCapabilities', {});

    // TODO: Get RTP capabilites from server
    const routerRtpCapabilities = response;
    this.device.load({ routerRtpCapabilities });
  }
}
