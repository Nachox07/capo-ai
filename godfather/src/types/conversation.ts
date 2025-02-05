export interface Message {
  id: string;
  prompt: string;
  response: string;
  timestamp: Date;
}

export interface Conversation {
  id: number;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationState {
  conversations: Conversation[];
} 