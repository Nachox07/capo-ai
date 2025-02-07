<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import type { ChatMessage, Chat } from "../types/chat";
import ChatSidebar from "./ChatSidebar.vue";
import TranscriptPage from "./TranscriptPage.vue";
import SummaryPage from "./SummaryPage.vue";

const input = ref("");
const isLoading = ref(false);
const activeChat = ref<string | null>(null);
const showTranscript = ref(false);
const selectedTranscriptChat = ref<string | null>(null);
const showSummary = ref(false);
const selectedSummaryChat = ref<string | null>(null);

// Enhanced chats data structure with messages
const chats = ref<Chat[]>([
  {
    id: "1",
    title: "First Conversation",
    lastMessage: "Hi, how can I help you?",
    timestamp: "2 min ago",
    messages: [
      {
        role: "assistant",
        content:
          "Hi, this is Capo.ai, I can help you contact support center for your problems",
      },
    ],
    conversationId: null,
  },
]);

// Computed property for current chat messages
const messages = computed(() => {
  const currentChat = chats.value.find((chat) => chat.id === activeChat.value);
  return currentChat?.messages || [];
});

// Initial welcome message
onMounted(() => {
  if (chats.value.length === 0) {
    handleNewChat();
  } else {
    activeChat.value = chats.value[0].id;
  }
});

const handleChatSelect = (chatId: string) => {
  activeChat.value = chatId;
};

const API_URL = "http://localhost:3002/statement";

const handleSubmit = async (e: Event) => {
  e.preventDefault();
  if (!input.value.trim() || !activeChat.value) return;

  const currentChatIndex = chats.value.findIndex(
    (chat) => chat.id === activeChat.value
  );
  if (currentChatIndex === -1) return;

  const userMessage: ChatMessage = {
    role: "user",
    content: input.value,
  };

  // Add message to current chat
  chats.value[currentChatIndex].messages.push(userMessage);
  chats.value[currentChatIndex].lastMessage = userMessage.content;
  chats.value[currentChatIndex].timestamp = "Just now";

  // Update chat title if this is the first user message
  if (
    chats.value[currentChatIndex].messages.filter((m) => m.role === "user")
      .length === 1
  ) {
    const title =
      userMessage.content.length > 30
        ? userMessage.content.slice(0, 30) + "..."
        : userMessage.content;
    chats.value[currentChatIndex].title = title;
  }

  isLoading.value = true;
  input.value = "";

  try {
    const requestBody = chats.value[currentChatIndex].conversationId
      ? {
          prompt: userMessage.content,
          conversationId: chats.value[currentChatIndex].conversationId,
        }
      : {
          prompt: userMessage.content,
        };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    const messagesLength = data.messages.length;

    if (!chats.value[currentChatIndex].conversationId && data.id) {
      chats.value[currentChatIndex].conversationId = data.id;
    }

    // Update where we store transcript messages
    if (data.submittedResponse?.messages) {
      chats.value[currentChatIndex].transcriptMessages =
        data.submittedResponse.messages;
    }

    // Store summary if it exists in the submittedResponse
    if (data.submittedResponse?.summary) {
      chats.value[currentChatIndex].summary = data.submittedResponse.summary;
    }

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: data.messages[messagesLength - 1].response,
    };

    chats.value[currentChatIndex].messages.push(assistantMessage);
    chats.value[currentChatIndex].lastMessage = assistantMessage.content;
  } catch (error) {
    console.error("Error:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleNewChat = () => {
  const newChatId = `chat-${Date.now()}`;

  // Add new chat to the list
  chats.value.unshift({
    id: newChatId,
    title: "New Conversation",
    lastMessage: "Start a new conversation",
    timestamp: "Just now",
    messages: [
      {
        role: "assistant",
        content:
          "Hi, this is Capo.ai, I can help you contact support center for your problems",
      },
    ],
    conversationId: null,
  });

  // Set the new chat as active
  activeChat.value = newChatId;
};

// Add this function to handle chat deletion
const handleDeleteChat = (chatId: string) => {
  const chatIndex = chats.value.findIndex((chat) => chat.id === chatId);
  if (chatIndex === -1) return;

  // Remove the chat
  chats.value.splice(chatIndex, 1);

  // If we deleted the active chat, select another one
  if (activeChat.value === chatId) {
    activeChat.value = chats.value.length > 0 ? chats.value[0].id : null;

    // If no chats left, create a new one
    if (chats.value.length === 0) {
      handleNewChat();
    }
  }
};

const handleCloseTranscript = () => {
  showTranscript.value = false;
  selectedTranscriptChat.value = null;
};

const emit = defineEmits<{
  (e: "send-message", message: string): void;
  (e: "view-summary", chatId: string): void;
}>();

const handleViewTranscript = () => {
  if (activeChat.value) {
    selectedTranscriptChat.value = activeChat.value;
    showTranscript.value = true;
  }
};

// Add handler for summary
const handleViewSummary = () => {
  if (activeChat.value) {
    selectedSummaryChat.value = activeChat.value;
    showSummary.value = true;
  }
};

// Add handler to close summary
const handleCloseSummary = () => {
  showSummary.value = false;
  selectedSummaryChat.value = null;
};
</script>

<template>
  <div class="flex">
    <ChatSidebar
      :chats="chats"
      :active-chat="activeChat"
      :on-chat-select="handleChatSelect"
      @new-chat="handleNewChat"
      @delete-chat="handleDeleteChat"
      @view-transcript="handleViewTranscript"
    />

    <div class="flex-1 mx-auto px-4 py-6">
      <div class="flex justify-between items-center mb-4">
        <h1
          class="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
        >
          CAPO.AI
        </h1>

        <div class="flex gap-2">
          <button
            v-if="activeChat && chats.find((c) => c.id === activeChat)?.summary"
            @click="handleViewSummary"
            class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Summary"
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
                d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </button>

          <button
            v-if="
              activeChat &&
              chats.find((c) => c.id === activeChat)?.transcriptMessages?.length
            "
            @click="handleViewTranscript"
            class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Transcript"
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
                d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"
              />
              <path
                fill-rule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Chat messages -->
      <div
        class="mb-6 h-[600px] overflow-y-auto rounded-xl bg-gray-50 p-6 shadow-sm border border-gray-100"
      >
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="mb-6 flex"
          :class="[message.role === 'user' ? 'justify-end' : 'justify-start']"
        >
          <div
            :class="[
              'rounded-2xl p-4 inline-block shadow-sm',
              message.role === 'user'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                : 'bg-white text-gray-800 border border-gray-100',
            ]"
          >
            {{ message.content }}
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="isLoading" class="flex items-center space-x-2 mb-6">
          <div class="flex space-x-1">
            <div
              class="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
              style="animation-delay: 0ms"
            ></div>
            <div
              class="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
              style="animation-delay: 150ms"
            ></div>
            <div
              class="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
              style="animation-delay: 300ms"
            ></div>
          </div>
        </div>
      </div>

      <!-- Input form -->
      <form @submit="handleSubmit" class="flex gap-4 items-end">
        <div class="flex-1 relative">
          <input
            type="text"
            v-model="input"
            placeholder="Type your message..."
            class="w-full h-14 rounded-full px-6 border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
            :disabled="isLoading"
          />
        </div>
        <button
          type="submit"
          class="h-14 px-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 transition-all shadow-sm"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="flex items-center gap-2">
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                fill="none"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Sending
          </span>
          <span v-else>Send</span>
        </button>
      </form>
    </div>
  </div>

  <TranscriptPage
    v-if="showTranscript && selectedTranscriptChat"
    :messages="
      chats.find((c) => c.id === selectedTranscriptChat)?.transcriptMessages ||
      []
    "
    :on-close="handleCloseTranscript"
  />

  <SummaryPage
    v-if="showSummary && selectedSummaryChat"
    :summary="chats.find((c) => c.id === selectedSummaryChat)?.summary || ''"
    :on-close="handleCloseSummary"
  />
</template>
