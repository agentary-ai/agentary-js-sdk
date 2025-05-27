import { extractPageContent } from "../utils/content-extraction.js";

/**
 * Generates relevant questions about the current page content
 */
export async function generatePagePrompts(
  llm,
  options = {}
) {
  const {
    maxQuestions = 5,
    focusAreas = []
  } = options;
  
  const pageContent = extractPageContent();
  
  if (!pageContent.trim()) {
    return ["What is this page about?", "Can you explain the main topic?"];
  }

  const focusAreasText = focusAreas.length > 0 
    ? `\n\nFocus particularly on these areas: ${focusAreas.join(', ')}`
    : '';
  
  const prompt = `
    Based on the following webpage content, generate ${maxQuestions} thoughtful and 
    relevant questions that would help a user learn more about the topic. The 
    questions should be:
    - Specific to the content
    - Educational and insightful
    - Varied in scope (some broad, some detailed)
    - Engaging and thought-provoking

    **Guidelines:**
    - No longer than 15 words
    - Do not include numbering, bullet points, or other formatting
    - Return a JSON array of strings, each representing a question

    **Webpage content:**
    ${pageContent}${focusAreasText}
  `;

  try {    
    const messages = [
      { role: "user", content: prompt }
    ];
    
    const startTime = performance.now();
    const response = await llm.chatCompletion(messages, {
      response_format: { type: "json_object", schema: `{ "type": "array", "items": { "type": "string" } }` }
    });
    const endTime = performance.now();
    console.log(`Chat completion took ${endTime - startTime}ms`);
    console.log(response);

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