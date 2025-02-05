export interface AIClient {
  generateResponse(prompt: string): Promise<string>;
} 