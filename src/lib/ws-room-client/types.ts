import { types as mediasoupTypes } from 'mediasoup-client';

type RequestResponseMethod =
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

type NotificationMethod =
  | 'peerClosed'
  | 'newPeer'
  | 'consumerClosed'
  | 'consumerPaused'
  | 'consumerResumed'
  | 'consumerLayersChanged';

type Method = RequestResponseMethod | NotificationMethod;

enum MsgType {
  Request = 0,
  Response = 1,
  Notification = 2
}

interface Request {
  type: MsgType.Request;
  method: RequestResponseMethod;
  id: string;
  data: any;
}

interface createWebRtcTransportRequest {
  forceTcp: boolean;
  producing: boolean;
  consuming: boolean;
}

interface connectWebRtcTransportRequest {
  transportId: string;
  dtlsParameters: mediasoupTypes.DtlsParameters;
}

interface restartIceRequest {
  transportId: string;
}

interface joinRequest {
  displayName: string;
  device: object;
  rtpCapabilites: mediasoupTypes.RtpCapabilities;
}

interface produceRequest {
  transportId: string;
  kind: mediasoupTypes.MediaKind;
  rtpParameters: mediasoupTypes.RtpParameters;
  appData: any;
}

interface newConsumerRequest {
  peerId: string;
  producerId: string;
  id: string;
  kind: mediasoupTypes.MediaKind;
  rtpParameters: mediasoupTypes.RtpParameters;
  type: 'simple' | 'simulcast' | 'svc' | 'pipe';
  appData: any;
  producerPaused: boolean;
}

interface closeProducerRequest {
  producerId: string;
}

interface pauseProducerRequest {
  producerId: string;
}

interface resumeProducerRequest {
  producerId: string;
}

interface pauseConsumerRequest {
  consumerId: string;
}

interface resumeConsumerRequest {
  consumerId: string;
}

interface setConsumerPreferredLayersRequest {
  consumerId: string;
  spatialLayer: number;
  temporalLayer: number | undefined;
}

interface setConsumerPriorityRequest {
  consumerId: string;
  priority: number;
}

interface requestConsumerKeyFrameRequest {
  consumerId: string;
}

interface Response {
  type: MsgType.Response;
  method: RequestResponseMethod;
  id: string;
  success: boolean;
  error?: string;
  data?: any;
}

interface Notification {
  type: MsgType.Notification;
  method: NotificationMethod;
  data: any;
}

interface newPeerNotification {
  id: string;
  displayName: string;
  device: any;
}

interface peerClosedNotification {
  peerId: string;
}

interface consumerClosedNotification {
  peerId: string;
  consumerId: string;
}

interface consumerPausedNotification {
  peerId: string;
  consumerId: string;
}

interface consumerResumedNotification {
  peerId: string;
  consumerId: string;
}

interface consumerLayersChangedNotification {
  peerId: string;
  consumerId: string;
  spatialLayer?: number | null;
  temporalLayer?: number | null;
}
type WebSocketMessage = Request | Response | Notification;

export type {
  createWebRtcTransportRequest,
  connectWebRtcTransportRequest,
  restartIceRequest,
  joinRequest,
  produceRequest,
  closeProducerRequest,
  pauseProducerRequest,
  newConsumerRequest,
  resumeProducerRequest,
  pauseConsumerRequest,
  resumeConsumerRequest,
  setConsumerPreferredLayersRequest,
  setConsumerPriorityRequest,
  requestConsumerKeyFrameRequest,
  WebSocketMessage,
  RequestResponseMethod,
  NotificationMethod,
  Method,
  Request,
  Response,
  Notification,
  newPeerNotification,
  peerClosedNotification,
  consumerClosedNotification,
  consumerPausedNotification,
  consumerResumedNotification,
  consumerLayersChangedNotification
};
export { MsgType };
