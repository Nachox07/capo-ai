import express, { Request, Response } from "express";
import cors from "cors";
import { OpenAIClient } from "./clients/OpenAIClient";
import { validateRequest } from "./middleware/validateRequest";
import {
  statementSchema,
  StatementRequest,
} from "./validators/statementValidator";
import { env } from "./config/env";
import { conversationManager } from "./state/conversationState";
import axios from 'axios';

const app = express();

app.use(cors());

const openAIClient = new OpenAIClient(env.OPENAI_API_KEY);

app.use(express.json());

app.post(
  "/statement",
  validateRequest(statementSchema),
  async (req: Request<{}, {}, StatementRequest>, res: Response) => {
    try {
      var { prompt } = req.body;
      const { conversationId } = req.body;
      let conversation;
      if (!conversationId) {
        prompt = `"${prompt}" What all information do I need to resolve this query?`;
      } else {
        conversation = conversationManager.getConversation(conversationId);
        if (!conversation) {
          return res.status(404).json({ error: "Conversation not found" });
        }
        if (conversation.messages.length > 1) {
          const problemStatement = conversation.messages
            .map((message,index) => `${index}. ${message.prompt}`)
            .join(".\n");
          const responses = conversation.messages
          .map((message,index) => `${index}. ${message.response}`)
          .join(".\n");
          prompt = `My problem statement was "${problemStatement}" and the responses were "${responses}". Do I have all the information I need to resolve this query?`;
        }
      }
      const response = await openAIClient.generateResponse(prompt);
      
      if (conversationId && conversation) {
        try {
          conversation = conversationManager.addMessageToConversation(
            conversationId,
            { prompt, response }
          );
        } catch (error) {
          return res.status(500).json({ error: "Something went wrong" });
        }
      } else {
        conversation = conversationManager.createConversation({
          prompt,
          response,
        });
      }
      let cronosResponse = null;
      try {
        const { data } = await axios.post(`${env.CRONOS_URL}/conversation`, {
          context: response
        });
        cronosResponse = {
          summary: data.response.summary,
          messages: data.response.messages
        }
      } catch (error) {
        console.error('Failed to send response to webhook:', error);
      }

      res.json({
        conversationId: conversation.id,
        response,
        conversation,
        cronosResponse
      });

    } catch (error) {
      console.error("Error processing statement:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

app.get("/conversations/:id", (req: Request, res: Response) => {
  const conversationId = parseInt(req.params.id, 10);
  if (isNaN(conversationId)) {
    return res.status(400).json({ error: "Invalid conversation ID" });
  }

  const conversation = conversationManager.getConversation(conversationId);
  if (!conversation) {
    return res.status(404).json({ error: "Conversation not found" });
  }
  res.json(conversation);
});

// Add endpoint to get all conversations
app.get("/conversations", (_req: Request, res: Response) => {
  const conversations = conversationManager.getAllConversations();
  res.json(conversations);
});

app.listen(env.PORT, () => {
  console.log(`Server is running in ${env.NODE_ENV} mode on port ${env.PORT}`);
});
