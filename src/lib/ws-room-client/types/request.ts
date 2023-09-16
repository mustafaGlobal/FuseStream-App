import { types as mediasoupTypes } from 'mediasoup-client';
import type { Device } from './peerInfo';

export interface CreateWebRtcTransportRequest {
  forceTcp: boolean;
  producing: boolean;
  consuming: boolean;
}

export interface ConnectWebRtcTransportRequest {
  transportId: string;
  dtlsParameters: mediasoupTypes.DtlsParameters;
}

export interface RestartIceRequest {
  transportId: string;
}

export interface JoinRequest {
  displayName: string;
  device: Device;
  rtpCapabilites: mediasoupTypes.RtpCapabilities;
}

export interface ProduceRequest {
  transportId: string;
  kind: mediasoupTypes.MediaKind;
  rtpParameters: mediasoupTypes.RtpParameters;
  appData: mediasoupTypes.AppData;
}

export interface NewConsumerRequest {
  peerId: string;
  producerId: string;
  id: string;
  kind: mediasoupTypes.MediaKind;
  rtpParameters: mediasoupTypes.RtpParameters;
  type: 'simple' | 'simulcast' | 'svc' | 'pipe';
  appData: mediasoupTypes.AppData;
  producerPaused: boolean;
}

export interface CloseProducerRequest {
  producerId: string;
}

export interface PauseProducerRequest {
  producerId: string;
}

export interface ResumeProducerRequest {
  producerId: string;
}

export interface PauseConsumerRequest {
  consumerId: string;
}

export interface ResumeConsumerRequest {
  consumerId: string;
}

export interface SetConsumerPreferredLayersRequest {
  consumerId: string;
  spatialLayer: number;
  temporalLayer: number | undefined;
}

export interface SetConsumerPriorityRequest {
  consumerId: string;
  priority: number;
}

export interface RequestConsumerKeyFrameRequest {
  consumerId: string;
}

export type RequestData =
  | CreateWebRtcTransportRequest
  | ConnectWebRtcTransportRequest
  | RestartIceRequest
  | JoinRequest
  | ProduceRequest
  | NewConsumerRequest
  | CloseProducerRequest
  | PauseProducerRequest
  | ResumeProducerRequest
  | PauseConsumerRequest
  | ResumeConsumerRequest
  | SetConsumerPreferredLayersRequest
  | SetConsumerPriorityRequest
  | RequestConsumerKeyFrameRequest
  | Record<string, undefined>;

export type RequestResponseMethod =
  | 'getRouterRtpCapabilities'
  | 'createWebRtcTransport'
  | 'connectWebRtcTransport'
  | 'restartIce'
  | 'join'
  | 'newConsumer'
  | 'produce'
  | 'closeProducer'
  | 'pauseProducer'
  | 'resumeProducer'
  | 'pauseConsumer'
  | 'resumeConsumer'
  | 'setConsumerPreferredLayers'
  | 'setConsumerPriority'
  | 'requestConsumerKeyFrame';
