import { processMessage } from "../../chat/index.js";
import { summarizeContent } from "../../summarize/index.js";
import { explainSelectedText } from "../../explain/index.js";
import { getSelectedText } from "../../utils/index.js";
import { marked } from "marked";

// Global variable to store generated questions for the page lifetime
let cachedQuestions = null;

/**
 * Configure marked for safe HTML rendering
 */
marked.setOptions({
  breaks: true,
  gfm: true,
});

/**
 * Renders markdown content safely
 */
function renderMarkdown(content) {
  try {
    return marked.parse(content);
  } catch (error) {
    console.warn("Error parsing markdown:", error);
    return content; // Fallback to plain text
  }
}

/**
 * Creates the chat dialog element
 */
export function createDialog(
  webLLMClient, 
  corner,
  uiOptions = {}
) {
  // Create dialog element
  const dialog = document.createElement("div");
  dialog.style.cssText = `
    position:fixed;
    bottom:5.5rem;
    ${corner === "bottom-right" ? "right:1.5rem" : "left:1.5rem"};
    width:350px;
    max-width:90vw;
    background:white;
    border-radius:0.75rem;
    box-shadow:0 10px 25px rgba(0,0,0,0.1);
    display:none;
    flex-direction:column;
    z-index:9998;
    max-height:70vh;
    overflow:hidden;
    opacity:0;
    transform:translateY(20px);
    transition:opacity 0.3s ease, transform 0.3s ease;
    font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    font-size:14px;
    line-height:1.5;
    color:#333;`;

  // Add markdown styles if they don't exist
  if (!document.querySelector('#markdown-styles')) {
    const style = document.createElement('style');
    style.id = 'markdown-styles';
    style.textContent = `
      .markdown-content h1, .markdown-content h2, .markdown-content h3, 
      .markdown-content h4, .markdown-content h5, .markdown-content h6 {
        margin: 0.5em 0 0.3em 0;
        font-weight: 600;
        line-height: 1.3;
      }
      .markdown-content h1 { font-size: 1.5em; }
      .markdown-content h2 { font-size: 1.3em; }
      .markdown-content h3 { font-size: 1.1em; }
      .markdown-content h4, .markdown-content h5, .markdown-content h6 { font-size: 1em; }
      
      .markdown-content p {
        margin: 0.5em 0;
      }
      
      .markdown-content code {
        background: #f1f5f9;
        padding: 0.125em 0.25em;
        border-radius: 0.25em;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        font-size: 0.875em;
      }
      
      .markdown-content pre {
        background: #f1f5f9;
        padding: 0.75em;
        border-radius: 0.5em;
        overflow-x: auto;
        margin: 0.5em 0;
      }
      
      .markdown-content pre code {
        background: none;
        padding: 0;
      }
      
      .markdown-content blockquote {
        border-left: 3px solid #e2e8f0;
        padding-left: 0.75em;
        margin: 0.5em 0;
        color: #64748b;
        font-style: italic;
      }
      
      .markdown-content ul, .markdown-content ol {
        margin: 0.5em 0;
        padding-left: 1.5em;
      }
      
      .markdown-content li {
        margin: 0.25em 0;
      }
      
      .markdown-content strong {
        font-weight: 600;
      }
      
      .markdown-content em {
        font-style: italic;
      }
      
      .markdown-content a {
        color: #6366f1;
        text-decoration: none;
      }
      
      .markdown-content a:hover {
        text-decoration: underline;
      }
      
      .markdown-content table {
        border-collapse: collapse;
        width: 100%;
        margin: 0.5em 0;
      }
      
      .markdown-content th, .markdown-content td {
        border: 1px solid #e2e8f0;
        padding: 0.5em;
        text-align: left;
      }
      
      .markdown-content th {
        background: #f8fafc;
        font-weight: 600;
      }
    `;
    document.head.appendChild(style);
  }

  // Create welcome message
  const welcomeMessage = document.createElement("div");
  welcomeMessage.style.cssText = `
    padding:1.5rem 1rem 1rem;
    text-align:center;`;
  
  const welcomeText = document.createElement("h3");
  welcomeText.textContent = "How can I help you today?";
  welcomeText.style.cssText = `
    margin:0;
    font-size:1.25rem;
    font-weight:700;
    color:#333;`;
  
  welcomeMessage.appendChild(welcomeText);
  dialog.appendChild(welcomeMessage);
  
  // Create dialog content with proper scrolling
  const dialogContent = document.createElement("div");
  dialogContent.style.cssText = `
    padding:1rem;
    flex-grow:1;
    overflow-y:auto;
    min-height:100px;
    max-height:calc(70vh - 200px);`;
  dialog.appendChild(dialogContent);

  // Create fixed chat input container (initially hidden)
  const chatInputContainer = document.createElement("div");
  chatInputContainer.style.cssText = `
    display:none;
    padding:1rem;
    border-top:1px solid #f0f0f0;
    background:white;
    border-radius:0 0 0.75rem 0.75rem;`;
  dialog.appendChild(chatInputContainer);
  
  // Helper function to show/hide chat input
  const showChatInput = (show) => {
    if (chatInputContainer) {
      chatInputContainer.style.display = show ? 'block' : 'none';
      // Hide actions when chat is shown
      const actionsContainer = dialog.querySelector('.actions-container');
      if (actionsContainer) {
        actionsContainer.style.display = show ? 'none' : 'flex';
      }
    }
  };

  // Helper function to disable/enable chat input
  const setChatInputDisabled = (disabled) => {
    const chatInput = chatInputContainer?.querySelector('input');
    const sendButton = chatInputContainer?.querySelector('button');
    
    if (chatInput) {
      chatInput.disabled = disabled;
      chatInput.style.opacity = disabled ? '0.6' : '1';
    }
    if (sendButton) {
      sendButton.disabled = disabled;
      sendButton.style.opacity = disabled ? '0.6' : '1';
    }
  };
  
  // Function to show the home screen with questions
  const showHomeScreen = async () => {
    // Clear any existing content
    dialogContent.innerHTML = "";
    
    // Hide chat input when showing home screen
    showChatInput(false);
    
    // Check if question generation is enabled
    if (uiOptions.generateQuestions === false) {
      // Show default welcome message
      const welcomeMessage = document.createElement("div");
      welcomeMessage.style.cssText = `
        padding: 1rem;
        text-align: center;
        color: #666;
      `;
      welcomeMessage.textContent = "Ready to help! Use the buttons below to get started.";
      dialogContent.appendChild(welcomeMessage);
      return;
    }
    
    // Check if model is ready
    if (webLLMClient.isModelLoading) {
      // Show model loading message
      const loadingMessage = document.createElement("div");
      loadingMessage.style.cssText = `
        padding: 1rem;
        text-align: center;
        color: #666;
        font-style: italic;
      `;
      loadingMessage.innerHTML = `
        <div style="margin-bottom: 0.5rem;">
          <i class="fas fa-spinner fa-spin" style="margin-right: 0.5rem;"></i>
          Loading AI model...
        </div>
        <div style="font-size: 0.875rem; color: #888;">
          Questions will be generated once the model is ready
        </div>
      `;
      dialogContent.appendChild(loadingMessage);
      return;
    }
    
    // Use cached questions if available, otherwise generate new ones
    let questions = [];
    
    if (cachedQuestions) {
      questions = cachedQuestions;
    } else {
      // Add loading message for question generation
      const loadingMessage = document.createElement("div");
      loadingMessage.style.cssText = `
        padding: 1rem;
        text-align: center;
        color: #666;
        font-style: italic;
      `;
      loadingMessage.textContent = "Generating relevant questions about this page...";
      dialogContent.appendChild(loadingMessage);
      
      try {
        // Generate questions
        questions = await webLLMClient.generatePagePrompts({ 
          maxQuestions: uiOptions.maxQuestions || 5 
        });
        
        // Cache the questions for the page lifetime
        cachedQuestions = questions;
        
        // Clear loading message
        dialogContent.innerHTML = "";
      } catch (error) {
        console.error("Error generating questions:", error);
        
        // Show fallback content
        dialogContent.innerHTML = "";
        const fallbackMessage = document.createElement("div");
        fallbackMessage.style.cssText = `
          padding: 1rem;
          text-align: center;
          color: #666;
        `;
        fallbackMessage.textContent = "Ready to help! Use the buttons below to get started.";
        dialogContent.appendChild(fallbackMessage);
        return;
      }
    }
    
    // Create questions container
    const questionsContainer = document.createElement("div");
    questionsContainer.style.cssText = `
      padding: 0.5rem 0;
    `;
    
    // Add title
    const questionsTitle = document.createElement("h4");
    questionsTitle.textContent = "Questions to explore:";
    questionsTitle.style.cssText = `
      margin: 0 0 0.75rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #333;
    `;
    questionsContainer.appendChild(questionsTitle);
    
    // Add questions as clickable buttons
    questions.forEach((question, index) => {
      const questionButton = document.createElement("button");
      questionButton.textContent = question;
      questionButton.style.cssText = `
        display: block;
        width: 100%;
        text-align: left;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 0.5rem;
        padding: 0.75rem;
        margin-bottom: 0.5rem;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.875rem;
        line-height: 1.4;
        color: #374151;
        transition: all 0.2s ease;
      `;
      
      // Add hover effects
      questionButton.addEventListener('mouseenter', () => {
        questionButton.style.background = '#f1f5f9';
        questionButton.style.borderColor = '#cbd5e1';
      });
      
      questionButton.addEventListener('mouseleave', () => {
        questionButton.style.background = '#f8fafc';
        questionButton.style.borderColor = '#e2e8f0';
      });
      
      // Handle question click
      questionButton.addEventListener('click', async () => {
        // Clear content and switch to Q&A mode
        dialogContent.innerHTML = "";
        
        // Add back button
        addBackButton(dialogContent, () => {
          showHomeScreen();
        });
        
        // Add user message
        addChatMessage(dialogContent, question, "user");
        
        // Create assistant message container
        const { contentElement } = addChatMessage(dialogContent, "", "assistant");
        
        // Disable chat input during response
        setChatInputDisabled(true);
        
        // Add typing indicator
        const typingIndicator = document.createElement("span");
        typingIndicator.className = "typing-indicator";
        typingIndicator.style.cssText = `
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #6366f1;
          margin-right: 4px;
          animation: pulse 1.5s infinite ease-in-out;
        `;
        contentElement.appendChild(typingIndicator);
        
        try {
          let responseText = "";
          
          // Process the question with the LLM
          await processMessage(
            llm, 
            question,
            (token) => {
              // Remove typing indicator when first token arrives
              if (responseText === "") {
                contentElement.innerHTML = "";
              }
              
              // Update full text
              responseText += token;
              
              // Render markdown progressively
              contentElement.innerHTML = renderMarkdown(responseText);
            }
          );
          
          // Setup and show chat input after response
          setupChatInput(chatInputContainer, llm, dialogContent, setChatInputDisabled);
          showChatInput(true);
          
        } catch (error) {
          contentElement.innerHTML = "I'm sorry, I couldn't process your question. Please try again.";
          console.error("Error processing question:", error);
        } finally {
          // Re-enable chat input
          setChatInputDisabled(false);
        }
      });
      
      questionsContainer.appendChild(questionButton);
    });
    
    dialogContent.appendChild(questionsContainer);
  };
  
  // Create dialog actions section with buttons for different functionalities
  const { actionsContainer } = createDialogActions(llm, dialogContent, showHomeScreen, chatInputContainer, showChatInput, setChatInputDisabled);
  actionsContainer.classList.add('actions-container');
  dialog.appendChild(actionsContainer);
  
  // Append dialog to body
  document.body.appendChild(dialog);

  // Function to show the dialog
  const showDialog = async () => {
    dialog.style.display = "flex";
    // Trigger animation after display is set
    setTimeout(() => {
      dialog.style.opacity = "1";
      dialog.style.transform = "translateY(0)";
    }, 10);

    // Show the home screen
    await showHomeScreen();
  };

  return { 
    dialog, 
    showDialog,
  };
}

/**
 * Adds a back button to return to the home screen
 */
function addBackButton(dialogContent, showHomeScreen) {
  const backButtonContainer = document.createElement("div");
  backButtonContainer.style.cssText = `
    padding: 0 0 1rem 0;
    border-bottom: 1px solid #f0f0f0;
    margin-bottom: 1rem;
  `;
  
  const backButton = document.createElement("button");
  backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Questions';
  backButton.style.cssText = `
    background: transparent;
    color: #6366f1;
    border: 1px solid #e2e8f0;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
  `;
  
  // Add hover effects
  backButton.addEventListener('mouseenter', () => {
    backButton.style.background = '#f8fafc';
    backButton.style.borderColor = '#cbd5e1';
  });
  
  backButton.addEventListener('mouseleave', () => {
    backButton.style.background = 'transparent';
    backButton.style.borderColor = '#e2e8f0';
  });
  
  // Handle back button click
  backButton.addEventListener('click', () => {
    showHomeScreen();
  });
  
  backButtonContainer.appendChild(backButton);
  dialogContent.appendChild(backButtonContainer);
}

/**
 * Creates the dialog actions area with buttons for different functionalities
 */
function createDialogActions(
  webLLMClient, 
  dialogContent,
  showHomeScreen,
  chatInputContainer,
  showChatInput,
  setChatInputDisabled
) {
  const actionsContainer = document.createElement("div");
  actionsContainer.style.cssText = `
    padding:1rem;
    border-top:1px solid #f0f0f0;
    display:flex;
    flex-wrap:wrap;
    gap:0.5rem;
    justify-content:center;`;
  
  // Helper function to clear previous content
  const clearContent = () => {
    dialogContent.innerHTML = "";
  };

  // Create Q&A button
  const qaBtn = document.createElement("button");
  qaBtn.innerHTML = '<i class="fas fa-comment-dots"></i> Q&A Chat';
  qaBtn.style.cssText = `
    background:#6366f1;
    color:white;
    border:none;
    border-radius:0.5rem;
    padding:0.75rem 1rem;
    cursor:pointer;
    font-family:inherit;
    font-size:inherit;
    font-weight:500;
    display:flex;
    align-items:center;
    gap:0.5rem;`;
  
  // Add click event to Q&A button
  qaBtn.onclick = () => {
    // Clear previous content
    clearContent();
    
    // Add back button
    addBackButton(dialogContent, () => {
      showHomeScreen();
    });
    
    // Add initial assistant message
    addChatMessage(dialogContent, "I'm ready to help! Ask me anything.", "assistant");
    
    // Setup and show chat input
    setupChatInput(chatInputContainer, llm, dialogContent, setChatInputDisabled);
    showChatInput(true);
  };
  
  // Create summarize button
  const summarizeBtn = document.createElement("button");
  summarizeBtn.innerHTML = '<i class="fas fa-file-alt"></i> Summarize Page';
  summarizeBtn.style.cssText = `
    background:#6366f1;
    color:white;
    border:none;
    border-radius:0.5rem;
    padding:0.75rem 1rem;
    cursor:pointer;
    font-family:inherit;
    font-size:inherit;
    font-weight:500;
    display:flex;
    align-items:center;
    gap:0.5rem;`;
  
  // Add click event to summarize button
  summarizeBtn.onclick = async () => {
    // Clear previous content
    clearContent();
    
    // Add back button
    addBackButton(dialogContent, () => {
      showHomeScreen();
    });
    
    // Add system message to chat
    addChatMessage(dialogContent, "Summarizing page content...", "system");
    
    // Disable buttons while processing
    summarizeBtn.disabled = true;
    summarizeBtn.style.opacity = "0.6";
    
    // Create assistant message container
    const { contentElement } = addChatMessage(dialogContent, "", "assistant");
    
    // Add typing indicator
    const typingIndicator = document.createElement("span");
    typingIndicator.className = "typing-indicator";
    typingIndicator.style.cssText = `
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #6366f1;
      margin-right: 4px;
      animation: pulse 1.5s infinite ease-in-out;
    `;
    contentElement.appendChild(typingIndicator);

    // Create style for typing animation if it doesn't exist
    if (!document.querySelector('#typing-animation-style')) {
      const style = document.createElement('style');
      style.id = 'typing-animation-style';
      style.textContent = `
        @keyframes pulse {
          0% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
          100% { opacity: 0.4; transform: scale(0.8); }
        }
      `;
      document.head.appendChild(style);
    }
    
    try {
      let summaryText = "";
      
      // Use the summarizeContent function with onToken callback
      await summarizeContent(webLLMClient, {
        onToken: (token) => {
          // Remove typing indicator when first token arrives
          if (summaryText === "") {
            contentElement.innerHTML = "";
          }
          
          // Update full text
          summaryText += token;
          
          // Render markdown progressively
          contentElement.innerHTML = renderMarkdown(summaryText);
        }
      });
      
    } catch (error) {
      // Handle error
      contentElement.innerHTML = "Error summarizing content. Please try again.";
      console.error("Error during summarization:", error);
    } finally {
      // Re-enable button
      summarizeBtn.disabled = false;
      summarizeBtn.style.opacity = "1";
    }
  };
  
  // Create explain selection button
  const explainBtn = document.createElement("button");
  explainBtn.innerHTML = '<i class="fas fa-search"></i> Explain Selection';
  explainBtn.style.cssText = `
    background:#6366f1;
    color:white;
    border:none;
    border-radius:0.5rem;
    padding:0.75rem 1rem;
    cursor:pointer;
    font-family:inherit;
    font-size:inherit;
    font-weight:500;
    display:flex;
    align-items:center;
    gap:0.5rem;`;
  
  // Add click event to explain button
  explainBtn.onclick = async () => {
    // Get selected text
    const selectedText = getSelectedText();
    
    if (!selectedText) {
      // Clear previous content
      clearContent();
      
      // Add back button
      addBackButton(dialogContent, () => {
        showHomeScreen();
      });
      
      // Add system message if no text is selected
      addChatMessage(dialogContent, "No text selected. Please select some text on the page to explain.", "system");
      return;
    }
    
    // Clear previous content
    clearContent();
    
    // Add back button
    addBackButton(dialogContent, () => {
      showHomeScreen();
    });
    
    // Add system message to chat
    addChatMessage(dialogContent, `Explaining selected text: "${selectedText.substring(0, 50)}${selectedText.length > 50 ? '...' : ''}"`, "system");
    
    // Disable button while processing
    explainBtn.disabled = true;
    explainBtn.style.opacity = "0.6";
    
    // Create assistant message container
    const { contentElement } = addChatMessage(dialogContent, "", "assistant");
    
    // Add typing indicator
    const typingIndicator = document.createElement("span");
    typingIndicator.className = "typing-indicator";
    typingIndicator.style.cssText = `
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #6366f1;
      margin-right: 4px;
      animation: pulse 1.5s infinite ease-in-out;
    `;
    contentElement.appendChild(typingIndicator);
    
    try {
      let explanationText = "";
      
      // Use the explainSelectedText function with onToken callback
      await explainSelectedText(webLLMClient, selectedText, {
        onToken: (token) => {
          // Remove typing indicator when first token arrives
          if (explanationText === "") {
            contentElement.innerHTML = "";
          }
          
          // Update full text
          explanationText += token;
          
          // Render markdown progressively
          contentElement.innerHTML = renderMarkdown(explanationText);
        }
      });
      
    } catch (error) {
      // Handle error
      contentElement.innerHTML = "Error explaining text. Please try again.";
      console.error("Error during explanation:", error);
    } finally {
      // Re-enable button
      explainBtn.disabled = false;
      explainBtn.style.opacity = "1";
    }
  };
  
  // Add buttons to the container
  actionsContainer.appendChild(qaBtn);
  actionsContainer.appendChild(summarizeBtn);
  actionsContainer.appendChild(explainBtn);
  
  return { actionsContainer };
}

/**
 * Sets up the chat input interface in the fixed container
 */
function setupChatInput(
  chatInputContainer,
  webLLMClient,
  dialogContent,
  setChatInputDisabled
) {
  // Clear any existing content
  chatInputContainer.innerHTML = "";
  
  // Create chat input interface
  const inputWrapper = document.createElement("div");
  inputWrapper.style.cssText = `
    display:flex;
    padding:0.5rem;
    background:#f5f5f5;
    border-radius:0.5rem;`;
  
  const chatInput = document.createElement("input");
  chatInput.type = "text";
  chatInput.placeholder = "Type your question here...";
  chatInput.style.cssText = `
    flex-grow:1;
    border:none;
    padding:0.5rem;
    border-radius:0.25rem;
    font-family:inherit;
    font-size:inherit;`;
  
  const sendButton = document.createElement("button");
  sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
  sendButton.style.cssText = `
    background:#6366f1;
    color:white;
    border:none;
    border-radius:0.25rem;
    width:2.5rem;
    margin-left:0.5rem;
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;`;
  
  // Function to handle sending messages
  const sendMessage = async () => {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Disable input during processing
    setChatInputDisabled(true);
    
    // Add user message to chat
    addChatMessage(dialogContent, message, "user");
    
    // Clear input field
    chatInput.value = "";
    
    // Create assistant message container
    const { contentElement } = addChatMessage(dialogContent, "", "assistant");
    
    // Add typing indicator
    const typingIndicator = document.createElement("span");
    typingIndicator.className = "typing-indicator";
    typingIndicator.style.cssText = `
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: #6366f1;
      margin-right: 4px;
      animation: pulse 1.5s infinite ease-in-out;
    `;
    contentElement.appendChild(typingIndicator);
    
    try {
      let responseText = "";
      
      // Process the message with the LLM
      await processMessage(
        webLLMClient, 
        message,
        (token) => {
          // Remove typing indicator when first token arrives
          if (responseText === "") {
            contentElement.innerHTML = "";
          }
          
          // Update full text
          responseText += token;
          
          // Render markdown progressively
          contentElement.innerHTML = renderMarkdown(responseText);
        }
      );
      
    } catch (error) {
      // Handle error
      contentElement.innerHTML = "I'm sorry, I couldn't process your request. Please try again.";
      console.error("Error during Q&A:", error);
    } finally {
      // Re-enable input
      setChatInputDisabled(false);
      // Focus the input for next message
      chatInput.focus();
    }
  };
  
  // Send message on Enter key
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
  
  // Send message on button click
  sendButton.addEventListener("click", sendMessage);
  
  // Append elements to input wrapper
  inputWrapper.appendChild(chatInput);
  inputWrapper.appendChild(sendButton);
  
  // Append input wrapper to chat input container
  chatInputContainer.appendChild(inputWrapper);
  
  // Focus the input
  setTimeout(() => chatInput.focus(), 100);
}

/**
 * Adds a chat message to the dialog content
 */
function addChatMessage(
  container, 
  message, 
  role
) {
  const isUser = role === "user";
  
  const messageContainer = document.createElement("div");
  messageContainer.style.cssText = `
    margin-bottom:1rem;
    text-align:${isUser ? "right" : "left"};
    opacity:0;
    transform:translateY(10px);
    transition:opacity 0.3s ease, transform 0.3s ease;`;
  
  // Trigger animation after a small delay
  setTimeout(() => {
    messageContainer.style.opacity = "1";
    messageContainer.style.transform = "translateY(0)";
  }, 10);
  
  const bubble = document.createElement("div");
  bubble.style.cssText = `
    display:inline-block;
    background:${isUser ? "#e9ecff" : "#f5f5f5"};
    padding:0.75rem;
    border-radius:${isUser ? "0.75rem 0.75rem 0 0.75rem" : "0.75rem 0.75rem 0.75rem 0"};
    max-width:80%;
    text-align:left;
    font-family:inherit;
    font-size:inherit;
    line-height:inherit;
    white-space:pre-wrap;`;
    
  // Add markdown-content class for assistant and system messages
  if (!isUser) {
    bubble.classList.add("markdown-content");
    bubble.style.whiteSpace = "normal"; // Override pre-wrap for markdown content
  }
    
  if (isUser) {
    bubble.textContent = message;
  } else {
    // For assistant messages, we'll add a typing animation
    bubble.style.position = "relative";
    if (message) {
      // Render markdown for assistant/system messages
      bubble.innerHTML = renderMarkdown(message);
    }
  }
  
  messageContainer.appendChild(bubble);
  container.appendChild(messageContainer);
  
  return { container: messageContainer, contentElement: bubble };
} 