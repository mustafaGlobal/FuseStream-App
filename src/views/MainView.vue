<script setup lang="ts">
import { useVideoStore } from '@/stores/video';

const videoStore = useVideoStore();

async function joinRoom() {
  try {
    await videoStore.joinRoom();
  } catch (error) {
    console.error('Error connecting: %o', error);
  }
}

async function enableCamera() {
  try {
    await videoStore.enableVideo();
  } catch (error) {
    console.error('Error enabling camera: %o', error);
  }
}

async function disableCamera() {
  try {
    await videoStore.disableVideo();
  } catch (error) {
    console.error('Error enabling camera: %o', error);
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
