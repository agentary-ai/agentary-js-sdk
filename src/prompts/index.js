import { extractPageContent } from "../utils/index.js";

/**
 * Generates relevant questions about the current page content
 * @param llm - The WebLLM client instance
 * @param options - Configuration options
 * @param options.maxQuestions - Maximum number of questions to generate
 * @param options.focusAreas - Array of focus areas for questions
 * @param options.maxContentTokens - Maximum tokens for content extraction
 * @param options.contentSelector - CSS selector for extracting article content
 */
export async function generatePagePrompts(
  llm,
  options = {}
) {
  const {
    maxQuestions = 5,
    maxContentTokens = 1500, // Leave room for prompt overhead
    contentSelector
  } = options;
  
  console.log("Starting prompt generation with options:", options);
  
  const pageContent = extractPageContent({ 
    contentSelector,
    maxTokens: maxContentTokens 
  });
  
  console.log("Extracted page content length:", pageContent.length);
  console.log("Page content preview:", pageContent.substring(0, 200) + "...");
  
  if (!pageContent.trim() || pageContent.length < 50) {
    console.log("Insufficient content found, returning fallback questions");
    return [
      "What is this page about?", 
      "Can you explain the main topic?",
      "What are the key points discussed here?",
      "How can I learn more about this subject?",
      "What questions might someone new to this topic have?"
    ].slice(0, maxQuestions);
  }
  
  const systemPrompt = `
    You are an educational assistant that generates thoughtful, engaging questions to help users learn about content they're reading.

    Your task is to analyze the provided content and generate ${maxQuestions} relevant questions that would help someone understand and engage with the material better.

    The questions should be:
    - Specific to the content provided
    - Educational and thought-provoking
    - Clear and well-formed
    - Varied in type (comprehension, analysis, application, etc.)

    Return your response as an array containing the ${maxQuestions} questions as strings.
  `;

  const userPrompt = `
    Generate ${maxQuestions} educational questions about this content:

    CONTENT:
    ${pageContent}

    Remember to return an array of questions.
`;

  try {    
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    console.log("Sending messages to LLM:", {
      systemPromptLength: systemPrompt.length,
      userPromptLength: userPrompt.length,
      contentLength: pageContent.length
    });
    
    const startTime = performance.now();
    const response = await llm.chatCompletion(messages, {
      response_format: { type: "json_object", schema: `{ "type": "array", "items": { "type": "string" } }` }
    });
    const endTime = performance.now();
    console.log(`Chat completion took ${endTime - startTime}ms`);

    console.log(`Prompt generation response:`, response);

    let questions = [];

    if (response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content) {
      try {
        const content = response.choices[0].message.content;
        console.log("Raw response content:", content);

        const parsed = JSON.parse(content);
        console.log("Parsed response:", parsed);

        // Handle different possible response formats
        if (parsed.questions && Array.isArray(parsed.questions)) {
          questions = parsed.questions;
        } else if (Array.isArray(parsed)) {
          questions = parsed;
        } else {
          console.warn("Unexpected response format:", parsed);
          questions = [];
        }

        // Validate and clean questions
        questions = questions
          .filter(q => typeof q === 'string' && q.trim().length > 0)
          .map(q => q.trim())
          .slice(0, maxQuestions);

        console.log("Final processed questions:", questions);

      } catch (e) {
        console.error("Error parsing JSON response:", e);
        console.error("Raw content that failed to parse:", response.choices[0].message.content);
        questions = [];
      }
    } else {
      console.error("Unexpected response structure:", response);
    }
    
    // Fallback questions if parsing fails or no valid questions returned
    if (questions.length === 0) {
      console.log("No valid questions generated, using content-aware fallbacks");
      
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
      
      return fallbackQuestions.slice(0, maxQuestions);
    }
    
    return questions.slice(0, maxQuestions);
    
  } catch (error) {
    console.error("Error generating questions:", error);
    
    // Return fallback questions
    return [
      "What is the main topic of this page?",
      "What are the key points discussed here?",
      "Can you explain this in simpler terms?",
      "What are the practical implications?",
      "How can I learn more about this topic?"
    ].slice(0, maxQuestions);
  }
}