import { defineStore } from 'pinia';
import VideoClient from '@/lib/video-client';
import shortUUID from 'short-uuid';

const url = 'ws://localhost:8000/ws';

export const useVideoStore = defineStore('VideoStore', {
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
    }
  }
});
