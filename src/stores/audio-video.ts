import { defineStore } from 'pinia';
import RoomClient from '@/lib/audio-video-client';
import VideoClient from '@/lib/audio-video-client';
import shortUUID from 'short-uuid';

const url = 'ws://localhost:8000/ws';

export const useAudioVideoStore = defineStore('audioVideoClient', {
  state: () => {
    return {
      client: null as VideoClient | null
    };
  },
  actions: {
    async joinRoom() {
      this.client = await RoomClient.create(url, 'test', shortUUID.generate(), 'Name');
      await this.client.join();
    }
  }
});
