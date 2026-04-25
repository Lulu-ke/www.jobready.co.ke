// z-ai-web-dev-sdk type augmentation — createChatCompletion is public at runtime
// but marked private in the published types. This override makes it accessible.
declare module 'z-ai-web-dev-sdk' {
  export default class ZAI {
    static create(): Promise<ZAI>;
    createChatCompletion(params: {
      messages: Array<{ role: string; content: string }>;
      temperature?: number;
      max_tokens?: number;
    }): Promise<{
      choices: Array<{ message?: { content?: string } }>;
    }>;
    createChatCompletionVision(params: {
      messages: Array<{ role: string; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }>;
      temperature?: number;
      max_tokens?: number;
    }): Promise<{
      choices: Array<{ message?: { content?: string } }>;
    }>;
  }
}
