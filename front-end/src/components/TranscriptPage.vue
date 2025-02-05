<script setup lang="ts">
import { defineProps } from "vue";
import type { TranscriptMessage } from "../types/chat";

const props = defineProps<{
  messages: TranscriptMessage[];
  onClose: () => void;
}>();
</script>

<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 z-50">
    <div
      class="relative w-full max-w-4xl mx-auto mt-20 bg-white rounded-xl shadow-lg"
    >
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">
            Conversation Transcript
          </h2>
          <button @click="onClose" class="p-2 hover:bg-gray-100 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="space-y-4 max-h-[600px] overflow-y-auto">
          <div
            v-for="(msg, idx) in messages"
            :key="idx"
            :class="[
              'max-w-[80%] p-4 rounded-lg',
              msg.role === 'bot'
                ? 'bg-blue-100 text-blue-800 ml-auto'
                : 'bg-green-100 text-green-800',
            ]"
          >
            {{ msg.content }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
