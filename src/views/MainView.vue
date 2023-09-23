<script setup lang="ts">
import { useVideoStore } from '@/stores/video';
import { ref, watchEffect } from 'vue';
import { useDebounceFn } from '@vueuse/core';

const myVideo = ref<HTMLVideoElement>();
const remoteVideo = ref<HTMLVideoElement>();

const videoStore = useVideoStore();

async function joinRoom() {
  try {
    await videoStore.joinRoom();
  } catch (error) {
    console.error('Error connecting: %o', error);
  }
}

const enableCamera = useDebounceFn(async () => {
  try {
    await videoStore.enableVideo();
  } catch (error) {
    console.error('Error enabling camera: %o', error);
  }
}, 100);

const disableCamera = useDebounceFn(async () => {
  try {
    await videoStore.disableVideo();
  } catch (error) {
    console.error('Error enabling camera: %o', error);
  }
}, 100);

joinRoom();

watchEffect(() => {
  if (myVideo.value) {
    if (videoStore.producer) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(videoStore.producer.track);
      myVideo.value.srcObject = mediaStream;
    }
  }

  if (remoteVideo.value) {
    if (videoStore.consumer) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(videoStore.consumer.track);
      remoteVideo.value.srcObject = mediaStream;
    }
  }
});
</script>

<template>
  <main>
    <div class="container mx-auto py-8">
      <div class="flex flex-wrap justify-center">
        <!-- Left Video -->
        <div class="w-full md:w-1/2 px-4">
          <video ref="myVideo" muted autoplay class="w-full h-auto bg-gray-800">
            <!-- Add video source here -->
          </video>
        </div>
        <!-- Right Video -->
        <div class="w-full md:w-1/2 px-4">
          <video ref="remoteVideo" muted autoplay class="w-full h-auto bg-gray-800">
            <!-- Add video source here -->
          </video>
        </div>
      </div>

      <!-- Buttons Section -->
      <div class="flex justify-center mt-4 space-x-4">
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          @click="enableCamera()"
        >
          enableCamera
        </button>

        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          @click="disableCamera()"
        >
          disableCamera
        </button>
      </div>
    </div>
  </main>
</template>
