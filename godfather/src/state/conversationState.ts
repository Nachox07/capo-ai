import {
  ConversationState,
  Conversation,
  Message,
} from "../types/conversation";
import { v4 as uuidv4 } from "uuid";

class ConversationManager {
  private state: ConversationState = {
    conversations: [],
  };

  createConversation(initialMessage: { prompt: string }): Conversation {
    const conversation: Conversation = {
      id: this.state.conversations.length + 1,
      messages: [
        {
          id: uuidv4(),
          ...initialMessage,
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.state.conversations.push(conversation);
    return conversation;
  }

  updateConversationMessage(
    conversationId: number,
    payload: Partial<Message>
  ): Conversation {
    console.debug("updateConversationMessage called with:", {
      conversationId,
      payload,
    });

    const conversationToUpdateIndex = this.getConversationIndex(conversationId);
    console.debug("conversationToUpdateIndex:", conversationToUpdateIndex);

    const conversationToUpdate =
      this.state.conversations[conversationToUpdateIndex];
    console.debug("conversationToUpdate:", conversationToUpdate);

    if (!conversationToUpdate) {
      throw new Error("Conversation not found");
    }

    const messageId = payload.id;

    if (conversationToUpdate.messages) {
      const { messages } = conversationToUpdate;
      const messageIndex = messages.findIndex((m) => m.id === messageId);

      const message = messages[messageIndex];
      console.debug("message before update:", messageIndex, message);

      const updatedMessage = {
        ...message,
        ...payload,
      };
      console.debug("updatedMessage:", updatedMessage);

      this.state.conversations[conversationToUpdateIndex].messages[
        messageIndex
      ] = updatedMessage;
    }

    console.debug(
      "Updated conversation:",
      this.state.conversations[conversationToUpdateIndex]
    );
    return this.state.conversations[conversationToUpdateIndex];
  }

  addMessageToConversation(
    conversationId: number,
    message: { prompt: string }
  ): Conversation {
    const conversation = this.getConversation(conversationId);

    if (!conversation) {
      throw new Error("Conversation not found");
    }
    const newMessage: Message = {
      id: uuidv4(),
      ...message,
      timestamp: new Date(),
    };

    conversation.messages.push(newMessage);
    conversation.updatedAt = new Date();

    return conversation;
  }

  getConversationIndex(id: number): number {
    return this.state.conversations.findIndex((c) => c.id === id);
  }

  getConversation(id: number): Conversation | undefined {
    return this.state.conversations.find((c) => c.id === id);
  }

  getAllConversations(): Conversation[] {
    return this.state.conversations;
  }
}

export const conversationManager = new ConversationManager();
