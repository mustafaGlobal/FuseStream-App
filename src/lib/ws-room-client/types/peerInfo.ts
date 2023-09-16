export interface Device {
  flag: string;
  name: string;
  version: string;
}

export interface PeerInfo {
  id: string;
  displayName: string;
  device: Device | null;
}
