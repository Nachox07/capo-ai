import { Request, Response } from 'express';
import { OpenAiService } from '../services/openAiService';

export class ConversationController {
  private openAiService: OpenAiService;

  constructor(openAiKey: string, webhookUrl: string) {
    this.openAiService = new OpenAiService(openAiKey, webhookUrl);
  }

  handleConversation = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Received request:', req.body);

      const { context } = req.body;

      if (!context || typeof context !== 'string') {
        console.error('Invalid context:', context);
        res.status(400).json({ error: 'Context is required and must be a string' });
        return;
      }

      const result = await this.openAiService.processConversation(context);
      res.status(200).json({ response: result });
    } catch (error) {
      console.error('Error processing conversation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
} 