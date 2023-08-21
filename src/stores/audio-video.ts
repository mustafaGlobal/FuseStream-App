import { defineStore } from 'pinia';
import { ref } from 'vue';
import RoomClient from '@/lib/audio-video-client';

const url = 'ws://localhost:8000/ws';

export const useAudioVideoStore = defineStore('audioVideoClient',{
  state: () => {
    return {
      client: null
    }
  },
  actions: {
    async joinRoom() {
      const client = await RoomClient.create(url, 'test', 'peer1');
      await client.getRtpCapabilites();
    }
  }
});
