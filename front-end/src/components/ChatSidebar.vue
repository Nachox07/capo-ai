<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import type { Chat } from "../types/chat";

const props = defineProps<{
  chats: Chat[];
  activeChat: string | null;
  onChatSelect: (chatId: string) => void;
}>();

const emit = defineEmits<{
  (e: "newChat"): void;
  (e: "deleteChat", chatId: string): void;
  (e: "view-transcript", chatId: string): void;
}>();

const handleNewChat = () => {
  emit("newChat");
};

const handleDeleteChat = (chatId: string, event: Event) => {
  event.stopPropagation(); // Prevent chat selection when clicking delete
  emit("deleteChat", chatId);
};

const handleViewTranscript = (chatId: string) => {
  emit("view-transcript", chatId);
};
</script>

<template>
  <div class="w-64 h-screen bg-gray-50 border-r border-gray-200 p-4">
    <div class="mb-4 flex justify-between items-center">
      <h2 class="text-lg font-semibold text-gray-700">Your Conversations</h2>
      <button
        @click="handleNewChat"
        class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Start new chat"
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
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      </button>
    </div>
    <div class="space-y-2">
      <div
        v-for="chat in chats"
        :key="chat.id"
        @click="onChatSelect(chat.id)"
        class="group relative w-full text-left p-3 rounded-lg transition-colors cursor-pointer"
        :class="[
          activeChat === chat.id
            ? 'bg-blue-50 text-blue-600'
            : 'hover:bg-gray-100 text-gray-700',
        ]"
      >
        <div class="font-medium truncate pr-6">{{ chat.title }}</div>
        <div class="text-sm text-gray-500 truncate">{{ chat.lastMessage }}</div>
        <div class="text-xs text-gray-400 mt-1">{{ chat.timestamp }}</div>

        <!-- Transcript button - only show if chat has transcriptMessages -->
        <button
          v-if="chat.transcriptMessages?.length"
          @click.stop="handleViewTranscript(chat.id)"
          class="absolute right-2 top-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-blue-50 transition-opacity"
          :class="[
            activeChat === chat.id
              ? 'text-blue-600'
              : 'text-gray-400 hover:text-blue-600',
          ]"
          title="View Transcript"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-4 h-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
            />
            <path
              fill-rule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        <!-- Delete button -->
        <button
          @click="(e) => handleDeleteChat(chat.id, e)"
          class="absolute right-2 top-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-opacity"
          :class="[
            activeChat === chat.id
              ? 'text-red-600'
              : 'text-gray-400 hover:text-red-600',
          ]"
          title="Delete chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-4 h-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
