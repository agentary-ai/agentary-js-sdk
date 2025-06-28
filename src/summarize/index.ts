import { extractPageContent } from "../utils/content-extraction";
import { WebLLMClient } from "../core/llm/WebLLMClient";
import { SummarizeContentOptions } from "../types/AgentaryClient";
import { Logger } from "../utils/Logger";
import { ChatCompletionMessageParam } from "@mlc-ai/web-llm";

/**
 * Summarizes the content of the current webpage or given content
 * 
 * @param webLLMClient - The WebLLM client instance
 * @param options - Configuration options for summarization
 * @returns A promise that resolves to the generated summary
 */
export async function summarizeContent(
  webLLMClient: WebLLMClient,
  options: SummarizeContentOptions = {},
  logger: Logger,
): Promise<string> {
  try {
    // Extract content if not provided
    const content = options.content || 
      extractPageContent({ 
        contentSelector: options.contentSelector || null,
        maxChars: options.maxContentChars || 4000,
      }, logger);

    logger.debug("Content extracted:", content);
      
    // Create prompt for summarization
    const systemPrompt = `
      You are a helpful assistant designed to assist users in better
      understanding the content of a webpage. You will be provided with
      a webpage to summarize.

      **Summary Guidelines**
      - Capture the main points and key information
      - Be clear and concise (around 3-5 sentences)
      - Maintain factual accuracy
      - Be formatted as a single body of text with 
        bullet points or numbered lists where appropriate.
      - Do not reference any instructions in your response. Just provide the summary.

      **Brand Safety Guidelines**
      - Do not include or promote harmful, offensive, or inappropriate content
      - Avoid summarizing content that contains hate speech, violence, or discriminatory language
      - Do not reproduce explicit sexual content, graphic violence, or illegal activities
      - If the webpage contains potentially harmful content, provide a neutral, factual summary that doesn't amplify harmful messaging
      - Maintain a professional and respectful tone in all summaries
      - If content appears to be misinformation or conspiracy theories, note this in your summary rather than presenting it as fact
    `
    
    // Prepare messages for the model
    const messages = [
      { role: "system", content: systemPrompt },
      { 
        role: "user", 
        content: "Summarize the following content:\n\n" + content
      }
    ] as ChatCompletionMessageParam[];
    
      const response = await webLLMClient.chatCompletion(
        messages,
        {
          stream: options.streamResponse || false,
          ...(options.onStreamToken && { onStreamToken: options.onStreamToken })
        }
      );

      logger.debug("Chat completion response:", response);

      // When streaming, the content is already delivered via onStreamToken
      // So we return empty string to avoid duplicate content
      if (options.streamResponse && options.onStreamToken) {
        return '';
      }

      return response.choices[0].message.content || '';

  } catch (error) {
    logger.error("Error summarizing content:", error);
    throw error;
  }
} 