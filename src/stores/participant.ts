import { defineStore, acceptHMRUpdate } from 'pinia';
import type { VideoParticipant } from './video';

interface Device {
  flag: string;
  name: string;
  version: string;
}

enum AudioStatus {
  NotJoined = 'not-joined',
  Muted = 'muted',
  Unmuted = 'unmuted',
  Talking = 'talking'
}

enum VideoStatus {
  NotJoined = 'not-joined',
  Off = 'off',
  On = 'on'
}

enum ScreenSharingStatus {
  NotJoined = 'not-joined',
  Viewer = 'viewer',
  Presenter = 'presenter'
}

enum ChatStatus {
  NotJoined = 'not-joined',
  Joined = 'joined',
  Typing = 'typing'
}

interface Status {
  audio: AudioStatus;
  video: VideoStatus;
  screenSharing: ScreenSharingStatus;
  chat: ChatStatus;
}

interface Participant {
  id: string;
  displayName: string;
  device: Device;
  status: Status;
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
        existingParticipant.status.video = VideoStatus.Off;
      } else {
        const status: Status = {
          audio: AudioStatus.NotJoined,
          video: VideoStatus.Off,
          screenSharing: ScreenSharingStatus.NotJoined,
          chat: ChatStatus.NotJoined
        };
        const newParticipant: Participant = { ...videoParticipant, status: status };
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

export type { Participant, Status, VideoStatus, Device };
