import { AIClient } from '../interfaces/AIClient';
import OpenAI from 'openai';

export class OpenAIClient implements AIClient {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-3.5-turbo',
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating OpenAI response:', error);
      throw error;
    }
  }
} 