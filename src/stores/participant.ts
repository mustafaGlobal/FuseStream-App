import { defineStore, acceptHMRUpdate } from 'pinia';
import type { VideoParticipant } from './video';
import type { Device } from '@/lib/video-client/deviceInfo';

interface Status {
  audio: 'not-joined' | 'muted' | 'unmuted' | 'talking';
  video: 'not-joined' | 'off' | 'on';
  screenSharing: 'not-joined' | 'viewer' | 'presenter';
  chat: 'not-joined' | 'joined' | 'typing';
}

interface VideoProducer {
  track: MediaStreamTrack;
}

interface Participant {
  id: string;
  displayName: string;
  device: Device;
  status: Status;
  videoProducer: VideoProducer | null;
}

export const useParticipantStore = defineStore('participantStore', {
  state: () => {
    return {
      participants: [] as Participant[]
    };
  },
  actions: {
    addParticipant(newParticipant: Participant) {
      this.participants.push(newParticipant);
    },

    addVideoParticipant(videoParticipant: VideoParticipant) {
      const existingParticipant = this.participants.find((p) => {
        p.id === videoParticipant.id;
      });

      if (existingParticipant) {
        existingParticipant.device = videoParticipant.device;
        existingParticipant.displayName = videoParticipant.displayName;
        existingParticipant.status.video = 'off';
        existingParticipant.videoProducer = null;
      } else {
        const status: Status = {
          audio: 'not-joined',
          video: 'off',
          screenSharing: 'not-joined',
          chat: 'not-joined'
        };
        const newParticipant: Participant = {
          ...videoParticipant,
          status: status,
          videoProducer: null
        };
        this.addParticipant(newParticipant);
      }
    },

    removeParticipant(id: string) {
      this.participants = this.participants.filter((participant) => participant.id !== id);
    }
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useParticipantStore, import.meta.hot));
}

export type { Participant, Status };
