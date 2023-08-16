import { defineStore } from 'pinia';
import RoomClient from '@/lib/audio-video-client';

const url = 'ws://localhost:8000/ws';

export const useAudioVideoStore = defineStore('audioVideoClient', () => {
  const joinRoom = async () => {
    const client = await RoomClient.create(url, 'test', 'peer1');

    await client.getRtpCapabilites();
  };
  // async function request() {
  //   console.log('Send');
  //   return await wsClient.request('getRouterRtpCapabilites');
  // }

  return { joinRoom };
});
