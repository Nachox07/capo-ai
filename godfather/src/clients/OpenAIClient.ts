import { AIClient } from "../interfaces/AIClient";
import OpenAI from "openai";

export class OpenAIClient implements AIClient {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4",
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("Error generating OpenAI response:", error);
      throw error;
    }
  }
}
