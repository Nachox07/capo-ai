export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface TranscriptMessage {
  role: 'bot' | 'support';
  content: string;
}

export interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messages: ChatMessage[];
  conversationId: string | null;
  transcriptMessages?: TranscriptMessage[];
  summary?: string;
} 