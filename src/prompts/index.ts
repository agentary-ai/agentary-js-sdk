import { WebLLMClient } from "../core/llm/WebLLMClient";
import { extractPageContent, Logger } from "../utils/index";
import { GeneratePromptsOptions } from "../types/AgentaryClient";
import { ChatCompletionMessageParam } from "@mlc-ai/web-llm";

/**
 * Generates relevant questions about the current page content
 * @param webLLMClient - The WebLLM client instance
 * @param options - Configuration options
 * @param logger - Logger instance for debugging
 * @returns A promise that resolves to an array of generated questions
 */
export async function generatePrompts(
  webLLMClient: WebLLMClient,
  options: GeneratePromptsOptions = {},
  logger: Logger,
): Promise<string[]> {
  const {
    promptCount = 5,
    maxContentChars = 4000, // Leave room for prompt overhead
    contentSelector,
    content
  } = options;
  
  logger.debug("Starting prompt generation with options:", options);
  
  // Extract content if not provided
  const pageContent = content || 
    extractPageContent({ 
      contentSelector: contentSelector || null,
      maxChars: maxContentChars 
    }, logger);
  
  logger.debug("Extracted page content length:", pageContent.length);
  logger.debug("Page content preview:", pageContent.substring(0, 200) + "...");
  
  if (!pageContent.trim() || pageContent.length < 50) {
    logger.debug("Insufficient content found, returning fallback questions");
    return [
      "What is this page about?", 
      "Can you explain the main topic?",
      "What are the key points discussed here?",
      "How can I learn more about this subject?",
      "What questions might someone new to this topic have?"
    ].slice(0, promptCount);
  }
  
  const systemPrompt = `
    You are an educational assistant that generates thoughtful, engaging questions to 
    help users learn about content they're reading.

    Your task is to analyze the provided content and generate ${promptCount} relevant 
    questions that would help someone understand and engage with the material better.

    The questions should be:
    - Specific to the content provided
    - Educational and thought-provoking 
    - Clear and well-formed
    - Varied in type (comprehension, analysis, application, etc.)
    - Max 10 words per question

    **IMPORTANT:** You must return your response as an array of strings containing the 
    ${promptCount} questions. DO NOT return a response using any other format.
  `;

  const userPrompt = `
    Generate ${promptCount} educational questions about this content:

    CONTENT:
    ${pageContent}

    Remember to return an array of questions.
`;

  try {    
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ] as ChatCompletionMessageParam[];

    logger.debug("Sending messages to LLM:", {
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length,
      contentLength: pageContent.length
    });
    
    const startTime = performance.now();
    const response = await webLLMClient.chatCompletion(messages, {
      stream: false,
      responseFormat: "json_object"
    });
    const endTime = performance.now();
    logger.debug(`Chat completion took ${endTime - startTime}ms`);

    logger.debug(`Prompt generation response:`, response);

    let questions: string[] = [];

    if (response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
      try {
        const content = response.choices[0].message.content;
        logger.debug("Raw response content:", content);

        const parsed = JSON.parse(content);
        logger.debug("Parsed response:", parsed);

        // Handle different possible response formats
        if (parsed.questions && Array.isArray(parsed.questions)) {
          questions = parsed.questions;
        } else if (Array.isArray(parsed)) {
          questions = parsed;
        } else {
          logger.warn("Unexpected response format:", parsed);
          questions = [];
        }

        // Validate and clean questions
        questions = questions
          .filter((q: any) => typeof q === 'string' && q.trim().length > 0)
          .map((q: any) => q.trim())
          .slice(0, promptCount);

        logger.debug("Final processed questions:", questions);

      } catch (e) {
        logger.error("Error parsing JSON response:", e);
        logger.error("Raw content that failed to parse:", response.choices[0].message.content);
        questions = [];
      }
    } else {
      logger.error("Unexpected response structure:", response);
    }
    
    // Fallback questions if parsing fails or no valid questions returned
    if (questions.length === 0) {
      logger.debug("No valid questions generated, using content-aware fallbacks");
      
      // Try to create more content-aware fallback questions
      const contentLower = pageContent.toLowerCase();
      const fallbackQuestions = [];
      
      if (contentLower.includes('how') || contentLower.includes('tutorial') || contentLower.includes('guide')) {
        fallbackQuestions.push("What are the main steps or process described here?");
      }
      if (contentLower.includes('why') || contentLower.includes('reason') || contentLower.includes('because')) {
        fallbackQuestions.push("What are the key reasons or explanations provided?");
      }
      if (contentLower.includes('benefit') || contentLower.includes('advantage') || contentLower.includes('important')) {
        fallbackQuestions.push("What are the main benefits or advantages discussed?");
      }
      if (contentLower.includes('problem') || contentLower.includes('challenge') || contentLower.includes('issue')) {
        fallbackQuestions.push("What problems or challenges are being addressed?");
      }
      
      // Add generic fallbacks
      fallbackQuestions.push(
        "What is the main topic of this content?",
        "What are the key points discussed here?",
        "How does this information relate to current trends?",
        "What practical applications does this have?",
        "What questions might someone new to this topic have?"
      );
      
      return fallbackQuestions.slice(0, promptCount);
    }
    
    return questions.slice(0, promptCount);
    
  } catch (error) {
    logger.error("Error generating questions:", error);
    
    // Return fallback questions
    return [
      "What is the main topic of this page?",
      "What are the key points discussed here?",
      "Can you explain this in simpler terms?",
      "What are the practical implications?",
      "How can I learn more about this topic?"
    ].slice(0, promptCount);
  }
}