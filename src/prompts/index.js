import { extractPageContent } from "../utils/index.js";

/**
 * Generates relevant questions about the current page content
 */
export async function generatePagePrompts(
  llm,
  options = {}
) {
  const {
    maxQuestions = 5,
    focusAreas = [],
    maxContentTokens = 1500 // Leave room for prompt overhead
  } = options;
  
  const pageContent = extractPageContent();
  
  if (!pageContent.trim()) {
    return ["What is this page about?", "Can you explain the main topic?"];
  }

  const focusAreasText = focusAreas.length > 0 
    ? `Focus on: ${focusAreas.join(', ')}`
    : '';
  
  // Optimized, more concise prompt
  const prompt = `
    Generate ${maxQuestions} educational questions about this content. Requirements:
      - Max 15 words per question
      - Specific to the content
      - Varied scope (broad to detailed)
      - Return JSON array of strings only

    ${focusAreasText}

    Content:
    ${pageContent}
  `;

  try {    
    const messages = [
      { role: "user", content: prompt }
    ];

    // // Rough token estimation for logging (4 characters per token)
    // const estimatedTokens = Math.ceil(prompt.length / 4);
    // console.log(`Estimated prompt tokens: ${estimatedTokens}`);
    
    // if (estimatedTokens > 3800) { // Leave buffer for response
    //   console.warn(`Prompt may be too long (${estimatedTokens} tokens), consider reducing maxContentTokens`);
    // }
    
    const startTime = performance.now();
    const response = await llm.chatCompletion(messages, {
      response_format: { type: "json_object", schema: `{ "type": "array", "items": { "type": "string" } }` }
    });
    const endTime = performance.now();
    console.log(`Chat completion took ${endTime - startTime}ms`);

    let questions = [];

    if (response.choices[0].message.content) {
      try {
        questions = JSON.parse(response.choices[0].message.content);
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