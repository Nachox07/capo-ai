import axios from 'axios';

export class WebhookService {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async sendRequest({ userId, sessionId, text, data }: {
    userId: string;
    sessionId: string;
    text: string;
    data?: {
      [key: string]: string;
    };
  }): Promise<string> {
    try {
      const response = await axios.post(this.webhookUrl, {
        userId: userId,
        sessionId: sessionId,
        text: text,
        data: data
      });
      return response.data?.text;
    } catch (error) {
      throw new Error(`Failed to send webhook request: ${error}`);
    }
  }
} 