import { WebLLMClient } from "../core/llm/WebLLMClient";
import { extractPageContent, Logger } from "../utils/index";
import { getSelectedText } from "../utils/index";
import { ExplainTextOptions } from "../types/AgentaryClient";
import { ChatCompletionMessageParam } from "@mlc-ai/web-llm";

/**
 * Explains the selected text on the webpage
 * 
 * @param webLLMClient - The WebLLM client instance
 * @param options - Configuration options
 * @param logger - The logger instance
 * @returns A promise that resolves to the generated explanation
 */
export async function explainText(
  webLLMClient: WebLLMClient,
  options: ExplainTextOptions = {},
  logger: Logger
) {
  try {
    const { 
      content, 
      contentSelector, 
      maxContentChars, 
      text, 
      selectedText 
    } = options;

    if (!text && !selectedText) {
      throw new Error("Either text or selected text must be provided");
    }

    let inputText = "";

    if (text) {
      inputText = text;
    } else if (selectedText) {
      inputText = getSelectedText();
    }

    logger.debug("Input text to explain:", inputText);
    
    // Create prompt for explanation
    const systemPrompt = `
      You are a helpful AI assistant designed to elaborate on a phrase or
      sentence, or explain a concept from the content of a webpage, provided 
      below.

      **Brand Safety Guidelines**
      
      - Do not include or promote harmful, offensive, or inappropriate content
      - Avoid explaining content that contains hate speech, violence, or 
        discriminatory language
      - Do not reproduce explicit sexual content, graphic violence, or illegal 
        activities
      - If the selected text contains potentially harmful content, provide a 
        neutral, educational explanation that doesn't amplify harmful messaging
      - Maintain a professional and respectful tone in all explanations
      - If content appears to be misinformation or conspiracy theories, note 
        this in your explanation rather than presenting it as fact
      - Focus on providing helpful, accurate, and constructive explanations

      **Webpage Content**
      
      ${content || extractPageContent({ 
        contentSelector: contentSelector || null, 
        maxChars: maxContentChars || 4000 
      }, logger)}
      
    `;
    
    // Prepare messages for the model
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Explain the following text: "${inputText}"` }
    ] as ChatCompletionMessageParam[];
    
    const response = await webLLMClient.chatCompletion(
      messages,
      {
        stream: options.streamResponse || false,
        ...(options.onStreamToken && { 
          onStreamToken: options.onStreamToken 
        })
      }
    ); 
    
    return response.choices[0].message.content || '';
  } catch (error) {
    console.error("Error explaining selected text:", error);
    throw error;
  }
}