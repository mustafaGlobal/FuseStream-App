import { types as mediasoupTypes } from 'mediasoup-client';
import type { PeerInfo } from './peerInfo';

export interface GetRouterRtpCapabilitiesResponse {
  codecs?: mediasoupTypes.RtpCodecCapability[];
  headerExtension?: mediasoupTypes.RtpHeaderExtension[];
}

export interface CreateWebRtcTransportResponse {
  id: string;
  iceParameters: mediasoupTypes.IceParameters;
  iceCandidates: mediasoupTypes.IceCandidate[];
  dtlsParamters: mediasoupTypes.DtlsParameters;
}

export interface RestartIceResponse {
  iceParameters: mediasoupTypes.IceParameters;
}

export interface JoinResponse {
  peers: PeerInfo[];
}

export interface ProduceResponse {
  producerId: string;
}

export type ResponseData =
  | GetRouterRtpCapabilitiesResponse
  | CreateWebRtcTransportResponse
  | RestartIceResponse
  | JoinResponse
  | ProduceResponse;
