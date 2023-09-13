import { defineStore, acceptHMRUpdate } from 'pinia';
import { types as mediasoupTypes } from 'mediasoup-client';
import { useParticipantStore } from './participant';
import type { Device } from './participant';
import VideoClient from '@/lib/video-client';
import shortUUID from 'short-uuid';
import { createLogger } from '@/lib/logger';

const url = 'ws://localhost:8000/ws';

const logger = createLogger('video');

interface VideoParticipant {
  id: string;
  displayName: string;
  device: Device;
}

interface Producer {
  id: string;
  paused: boolean;
  track: MediaStreamTrack;
  rtpParameters: mediasoupTypes.RtpParameters;
  codec: string;
}

enum Status {
  closed = 'closed',
  connecting = 'connecting',
  connected = 'connected'
}

export const useVideoStore = defineStore('videoStore', {
  state: () => {
    return {
      status: Status.closed as Status,
      client: null as VideoClient | null,
      producer: null as Producer | null
    };
  },
  actions: {
    async joinRoom() {
      this.status = Status.connecting;
      const participantStore = useParticipantStore();

      const uuid: string = shortUUID.generate();
      const displayName: string = 'User-' + uuid;
      const roomId: string = 'test';

      this.client = await VideoClient.create({
        url: url,
        roomId: roomId,
        peerId: uuid,
        displayName: displayName,
        svcEnabled: true,
        numOfSimulcastStreams: 3
      });

      this.client.on('join', (peers: VideoParticipant[]) => {
        this.status = Status.connected;
        const videoParticipants = peers;
        for (const videoParticipant of videoParticipants) {
          logger.info('new video participant: %o', videoParticipant);
          participantStore.addVideoParticipant(videoParticipant);
        }
      });

      this.client.on('newPeer', (videoParticipant: VideoParticipant) => {
        logger.info('new video participant: %o', videoParticipant);
        participantStore.addVideoParticipant(videoParticipant);
      });

      this.client.on('removePeer', (data: { peerId: string }) => {
        logger.info('video participant left with id: %o', data.peerId);
        participantStore.removeParticipant(data.peerId);
      });

      this.client?.on('addProducer', (producer: Producer) => {
        logger.info('addProducerEvent %o', producer);
        this.producer = producer;
      });

      this.client.on('close', () => {
        this.status = Status.closed;
      });
    },
    async enableVideo() {
      this.client?.enableVideo();
    },
    async disableVideo() {
      this.client?.disableVideo();
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useVideoStore, import.meta.hot));
}

export type { VideoParticipant };
