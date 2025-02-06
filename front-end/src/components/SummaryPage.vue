<script setup lang="ts">
defineProps<{
  summary: string;
  onClose: () => void;
}>();
</script>

<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg w-[600px] max-h-[80vh] flex flex-col">
      <div
        class="p-4 border-b border-gray-200 flex justify-between items-center"
      >
        <h2 class="text-lg font-semibold text-gray-700">
          Conversation Summary
        </h2>
        <button
          @click="onClose"
          class="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div class="p-6 overflow-y-auto">
        <p class="text-gray-600 whitespace-pre-wrap">{{ summary }}</p>
      </div>
    </div>
  </div>
</template>
