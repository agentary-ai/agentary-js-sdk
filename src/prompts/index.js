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
  
  const pageContent = extractPageContent({ contentSelector });
  
  if (!pageContent.trim()) {
    return ["What is this page about?", "Can you explain the main topic?"];
  }
  
  // Optimized, more concise prompt
  // const systemPrompt = `You are an educational content assistant that generates questions to help users learn from web content.

  //   STRICT REQUIREMENTS:
  //   1. Generate exactly the requested number of questions (no more, no less)
  //   2. Each question must be 15 words or fewer
  //   3. Questions must be specific to the actual content provided
  //   4. Include a mix of: overview questions, detail questions, and analytical questions
  //   5. Return ONLY a valid JSON object with a "questions" array

  //   RESPONSE FORMAT (exact structure required):
  //   {
  //     "questions": [
  //       "What is the main topic discussed?",
  //       "Who are the key people mentioned?",
  //       "What specific details are highlighted?"
  //     ]
  //   }
  // `;

  const systemPrompt = `You are an educational content assistant that generates questions to help users learn from web content.`;

  const userPrompt = `Generate exactly ${maxQuestions} educational questions for the following content:

${pageContent.substring(0, 4000) + (pageContent.length > 4000 ? '...' : '')}`;

  try {    
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    console.log(messages);
    
    const startTime = performance.now();
    const response = await llm.chatCompletion(messages, {
      response_format: { 
        type: "json_object", 
        schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: { type: "string" },
              minItems: maxQuestions,
              maxItems: maxQuestions
            }
          },
          required: ["questions"]
        }
      }
    });
    const endTime = performance.now();
    console.log(`Chat completion took ${endTime - startTime}ms`);

    console.log(`Prompt generation response: ${JSON.stringify(response)}`);

    let questions = [];

    if (response.choices[0].message.content) {
      try {
        const parsedResponse = JSON.parse(response.choices[0].message.content);
        questions = parsedResponse.questions || [];
        // Ensure questions is an array and contains valid strings
        if (!Array.isArray(questions) || questions.some(q => typeof q !== 'string')) {
          questions = [];
        }
      } catch (e) {
        console.error("Error parsing JSON response:", e);
        questions = [];
      }
    }
    
    // Fallback questions if parsing fails or no valid questions returned
    if (questions.length === 0) {
      return [
        "What is the main topic of this page?",
        "What are the key points discussed here?",
        "How does this information relate to current trends?",
        "What practical applications does this have?",
        "What questions might someone new to this topic have?"
      ].slice(0, maxQuestions);
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