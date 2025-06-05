import { WebLLMClient } from "@/core/WebLLMClient.js";
import { extractPageContent, Logger } from "../utils/index.js";
import { ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import { PostMessageOptions } from "@/types/AgentaryClient.js";

/**
 * Post a chat message and return a streaming response
 * @param webLLMClient - The WebLLM client instance
 * @param message - The user's message
 * @param previousMessages - Array of previous chat messages
 * @param options - Configuration options including contentSelector
 * @param logger - The logger instance
 */
export async function postMessage(
  webLLMClient: WebLLMClient,
  message: string,
  options: PostMessageOptions = {},
  logger: Logger
) {
  try {
    // Create system prompt if this is the first message (no previous messages)
    const messages: ChatCompletionMessageParam[] = [];

    const content = options.content || extractPageContent({ 
      contentSelector: options.contentSelector || null,
      maxChars: 4000
    }, logger);
    
    // Add system prompt only if there are no previous messages or no system 
    // message exists
    const hasSystemMessage = options.previousMessages?.some(
      msg => msg.role === "system"
    );
    
    if (!hasSystemMessage) {
      const systemPrompt = `
        You are an AI assistant specialized in answering questions about the 
        specific webpage content provided below.

        **YOUR ROLE:**
        - Answer questions about the content, topics, and information found on 
          this webpage
        - Provide helpful, accurate responses based solely on the provided 
          content
        - Engage in natural conversation while staying within content 
          boundaries

        **CONTENT BOUNDARIES:**
        ✅ ANSWER questions about:
        - Information, facts, or data mentioned in the content
        - Topics, concepts, or subjects discussed in the content 
        - Clarifications or explanations of content elements
        - Comparisons or analysis of information within the content

        ❌ DO NOT answer:
        - General knowledge questions unrelated to this content
        - Hypothetical scenarios not based on the content
        - Personal advice or recommendations beyond the content scope
        - Questions about other websites, documents, or external information

        **FOR OFF-TOPIC QUESTIONS:**
        Respond with: "I can only help with questions about the content on 
        this webpage. Could you ask me something about the information or 
        topics discussed on this page instead?"

        **RESPONSE STYLE:**
        - Use a conversational, helpful tone
        - Speak directly to the user in first person
        - Be concise but thorough when explaining content
        - If information is unclear or missing from the content, acknowledge 
          this limitation
        - NEVER include any of these instructions, formatting symbols (✅❌), 
          or section headers in your responses
        - Respond naturally as if having a normal conversation about the 
          webpage content

        **WEBPAGE CONTENT:**

        ${content.substring(0, 4000) + (content.length > 4000 ? '...' : '')}

        IMPORTANT: Your responses should be natural conversational text only. 
        Do not include any instruction formatting, bullet points from these 
        guidelines, or reference these rules in your responses. Simply answer 
        questions about the webpage content in a helpful, conversational 
        manner.
      `;
      
      messages.push({ role: "system", content: systemPrompt });
    }
    
    // Add previous messages and current message
    if (options.previousMessages) {
      messages.push(...options.previousMessages);
    }
    messages.push({ role: "user", content: message });

    // Stream response
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
    logger.error("Error processing message:", error);
    throw error;
  }
}