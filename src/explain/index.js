import { extractPageContent } from "../utils/index.js";
import { getSelectedText } from "../utils/index.js";

/**
 * Explains the selected text on the webpage
 * 
 * @param llm - The WebLLM client instance
 * @param text - The text to explain (if not provided, will use current selection)
 * @param options - Configuration options
 * @returns A promise that resolves to the generated explanation
 */
export async function explainSelectedText(
  llm,
  text,
  options = {}
) {
  try {
    const { articleSelector } = options;
    
    // Get selected text if not provided
    const selectedText = text || getSelectedText();
    
    if (!selectedText) {
      return "No text selected. Please select some text to explain.";
    }
    
    // Create prompt for explanation
    const systemPrompt = `
      You are a helpful AI assistant designed elaborate on a phrase or
      sentence, or explain a concept from the content of a webpage, provided 
      below.

      **Brand Safety Guidelines**
      
      - Do not include or promote harmful, offensive, or inappropriate content
      - Avoid explaining content that contains hate speech, violence, or discriminatory language
      - Do not reproduce explicit sexual content, graphic violence, or illegal activities
      - If the selected text contains potentially harmful content, provide a neutral, educational explanation that doesn't amplify harmful messaging
      - Maintain a professional and respectful tone in all explanations
      - If content appears to be misinformation or conspiracy theories, note this in your explanation rather than presenting it as fact
      - Focus on providing helpful, accurate, and constructive explanations

      **Webpage Content**
      
      ${extractPageContent({
        articleSelector
      })}
      
    `;
    
    // Prepare messages for the model
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Explain the following text: "${selectedText}"` }
    ];
    
    // Stream response
    const chunks = await llm.streamingChatCompletion(messages);
    let explanationText = "";
    
    for await (const chunk of chunks) {
      if (chunk.choices && chunk.choices[0]?.delta?.content) {
        const token = chunk.choices[0].delta.content;
        explanationText += token;
        if (options.onToken) {
          options.onToken(token);
        }
      }
    }
    
    return explanationText;
  } catch (error) {
    console.error("Error explaining selected text:", error);
    throw error;
  }
}