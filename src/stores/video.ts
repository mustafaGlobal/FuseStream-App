import { defineStore } from 'pinia';
import { useParticipantStore } from './participant';
import type { Device } from './participant';
import VideoClient from '@/lib/video-client';
import shortUUID from 'short-uuid';

const url = 'ws://localhost:8000/ws';

interface VideoParticipant {
  id: string;
  displayName: string;
  device: Device;
}

export const useVideoStore = defineStore('videoStore', {
  state: () => {
    return {
      client: null as VideoClient | null
    };
  },
  actions: {
    async joinRoom() {
      const uuid: string = shortUUID.generate();
      const displayName: string = 'User-' + uuid;
      const roomId: string = 'test';

      this.client = await VideoClient.create(url, roomId, uuid, displayName);

      this.client.on('newPeer', (videoParticipant: VideoParticipant) => {
        const participantStore = useParticipantStore();
        participantStore.addVideoParticipant(videoParticipant);
      });
    }
  }
});

export type { VideoParticipant };
