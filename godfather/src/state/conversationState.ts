import { ConversationState, Conversation, Message } from '../types/conversation';
import { v4 as uuidv4 } from 'uuid';

class ConversationManager {
  private state: ConversationState = {
    conversations: [],
  };

  createConversation(initialMessage: { prompt: string, response: string }): Conversation {
    const conversation: Conversation = {
      id: this.state.conversations.length + 1,
      messages: [{
        id: uuidv4(),
        ...initialMessage,
        timestamp: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.state.conversations.push(conversation);
    return conversation;
  }

  addMessageToConversation(
    conversationId: number,
    message: { prompt: string, response: string }
  ): Conversation {
    const conversation = this.state.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    ;

    const newMessage: Message = {
      id: uuidv4(),
      ...message,
      timestamp: new Date()
    };

    conversation.messages.push(newMessage);
    conversation.updatedAt = new Date();
    
    return conversation;
  }

  getConversation(id: number): Conversation | undefined {
    return this.state.conversations.find(c => c.id === id);
  }

  getAllConversations(): Conversation[] {
    return this.state.conversations;
  }
}

export const conversationManager = new ConversationManager(); 