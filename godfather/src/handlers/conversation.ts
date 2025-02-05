import { Request, Response } from "express";
import { conversationManager } from "../state/conversationState";

export async function getConversation(req: Request, res: Response) {
  const conversationId = parseInt(req.params.id, 10);
  if (isNaN(conversationId)) {
    return res.status(400).json({ error: "Invalid conversation ID" });
  }

  const conversation = conversationManager.getConversation(conversationId);
  if (!conversation) {
    return res.status(404).json({ error: "Conversation not found" });
  }
  res.json(conversation);
}

export async function getAllConversations(_req: Request, res: Response) {
  const conversations = conversationManager.getAllConversations();
  res.json(conversations);
}
