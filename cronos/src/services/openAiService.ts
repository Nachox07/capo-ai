import { OpenAI } from 'openai';
import { WebhookService } from './webhookService';
import { randomUUID } from 'crypto';

export class OpenAiService {
  private openai: OpenAI;
  private webhookService: WebhookService;

  constructor(apiKey: string, webhookUrl: string) {
    this.openai = new OpenAI();
    this.webhookService = new WebhookService(webhookUrl);
  }

  async processConversation(context: string): Promise<{ resolved: boolean, summary: string, messages: Array<{ role: string, content: string }>, reply?: string }> {
    let conversationComplete = false;
    let currentContext = context;
    let response = '';
    const messages: Array<{ role: string, content: string }> = [];

    const userId = randomUUID();
    const sessionId = randomUUID();

    const systemPrompt = `
      You are Capo AI, a conversational assistant impersonating a user in communication with customer support.
      Your task is to:
      1. Understand user query and prepare replies based on the given conversation context. It will be sent to the customer support agent.
      2. If the query is resolved, reply with 'QUERY_RESOLVED' and provide a summary for the user.
      3. If more interaction is needed, continue the conversation naturally with customer support.

      At all times, ensure:
      - Responses are polite, concise, and advance the resolution of the issue.
      - If resolved, provide a clear summary of the result and any pending actions.
    `;

    while (!conversationComplete) {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: currentContext
          }
        ],
      });

      response = completion.choices[0].message?.content || '';
      console.log('OpenAI response:', response);

      if (response.includes('QUERY_RESOLVED')) {
        conversationComplete = true;
        const summaryStart = response.indexOf('QUERY_RESOLVED') + 'QUERY_RESOLVED'.length;
        const summary = response.substring(summaryStart).trim();

        const finalMessage = "Thank you for your message, that's all we need to know.";

        await this.webhookService.sendRequest({
          userId,
          sessionId,
          text: finalMessage,
        });

        messages.push({ role: 'bot', content: finalMessage });

        return {
          resolved: true,
          summary: summary,
          messages: messages
        };
      } else {
        messages.push({ role: 'bot', content: response });
      }

      const webhookResponse = await this.webhookService.sendRequest({
        userId,
        sessionId,
        text: response,
      });

      console.log('Response from webhook:', webhookResponse);

      messages.push({ role: 'support', content: webhookResponse || 'No response' });

      currentContext = `Previous context:\n${currentContext}\nBot's response:\n${response}\nCustomer support input:\n${webhookResponse}`;

      conversationComplete = false;
    }

    return {
      resolved: false,
      summary: 'The issue is still in progress. Please continue the conversation with the provided reply.',
      messages: messages,
      reply: response
    };
  }
}