import type { Device } from './peerInfo';

export interface NewPeerNotification {
  id: string;
  displayName: string;
  device: Device;
}

export interface PeerClosedNotification {
  peerId: string;
}

export interface ConsumerClosedNotification {
  peerId: string;
  consumerId: string;
}

export interface ConsumerPausedNotification {
  peerId: string;
  consumerId: string;
}

export interface ConsumerResumedNotification {
  peerId: string;
  consumerId: string;
}

export interface ConsumerLayersChangedNotification {
  peerId: string;
  consumerId: string;
  spatialLayer?: number | null;
  temporalLayer?: number | null;
}

export type NotificationData =
  | NewPeerNotification
  | PeerClosedNotification
  | ConsumerClosedNotification
  | ConsumerPausedNotification
  | ConsumerResumedNotification
  | ConsumerLayersChangedNotification
  | Record<string, never>;

export type NotificationMethod =
  | 'peerClosed'
  | 'newPeer'
  | 'consumerClosed'
  | 'consumerPaused'
  | 'consumerResumed'
  | 'consumerLayersChanged';
