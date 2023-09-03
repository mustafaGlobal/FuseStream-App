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
      this.client = await VideoClient.create(url, 'test', shortUUID.generate(), 'Name');
    }
  }
});
