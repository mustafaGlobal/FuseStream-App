<script setup lang="ts">
import { useAudioVideoStore } from '@/stores/audio-video';

const audioVideoStore = useAudioVideoStore();

async function joinRoom() {
  try {
    await audioVideoStore.joinRoom();
  } catch (error) {
    console.error('Error connecting: %o', error);
  }
}

joinRoom();
</script>

<template>
  <main>
    <div class="container mx-auto py-8">
      <div class="flex flex-wrap justify-center">
        <!-- Left Video -->
        <div class="w-full md:w-1/2 px-4">
          <video id="my-video" class="w-full h-auto bg-gray-800" controls>
            <!-- Add video source here -->
          </video>
        </div>
        <!-- Right Video -->
        <div class="w-full md:w-1/2 px-4">
          <video id="remote-video" class="w-full h-auto bg-gray-800" controls>
            <!-- Add video source here -->
          </video>
        </div>
      </div>

      <!-- Buttons Section -->
      <div class="flex justify-center mt-4 space-x-4">
        <button
          id="btnCam"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled
        >
          publishVideo
        </button>
        <button
          id="btnScreen"
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled
        >
          publishScreen
        </button>
        <button
          id="btnSub"
          class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          subscribe
        </button>
      </div>
    </div>
  </main>
</template>
