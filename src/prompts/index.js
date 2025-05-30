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
  
  const systemPrompt = `
    You are an educational assistant that generates 
    ${maxQuestions} questions to help 
    users better understand a piece of content you will be 
    provided.
    
    **IMPORTANT**
    - You MUST return the result as a list of strings.
    - Each question must be 15 words or less.
    - You MUST generate EXACTLY ${maxQuestions} questions.
  `;

  const userPrompt = `Generate ${maxQuestions} questions about this content:

${pageContent.substring(0, 4000) + (pageContent.length > 4000 ? '...' : '')}
`;

  try {    
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    console.log(messages);
    
    const startTime = performance.now();
    const response = await llm.chatCompletion(messages, {
      response_format: { type: "json_object", schema: `{ "type": "array", "items": { "type": "string" } }` }
    });
    const endTime = performance.now();
    console.log(`Chat completion took ${endTime - startTime}ms`);

    console.log(`Prompt generation response: ${JSON.stringify(response)}`);

    let questions = [];

    if (response.choices[0].message.content) {
      try {
        console.log(response.choices[0].message.content);

        questions = JSON.parse(response.choices[0].message.content);

        console.log(`Questions parsed: ${JSON.stringify(questions)}`);

        // Ensure questions is an array and contains valid question strings
        if (Array.isArray(questions)) {
          questions = questions
            .filter(q => typeof q === 'string' && q.trim().length > 0)
            .slice(0, maxQuestions);
        } else {
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