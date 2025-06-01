import { addSelectionMonitor } from "./selection-helper.js";
import { marked } from "marked";
import { getSelectedText } from "../utils/index.ts";
import { explainSelectedText } from "../explain/index.js";

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
 * Creates a context menu for selected text
 * @param webLLMClient - The WebLLM client instance
 * @param options - Configuration options including contentSelector
 * @returns A cleanup function to remove the context menu event listeners
 */
export function createContextMenu(webLLMClient, options = {}) {
  // Create a floating button that appears when text is selected
  const contextButton = document.createElement("div");
  contextButton.style.cssText = `
    position: absolute;
    background: #6366f1;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    cursor: pointer;
    z-index: 9999;
    display: none;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    transition: opacity 0.2s ease;
    opacity: 0;
  `;
  contextButton.innerHTML = '<i class="fas fa-search"></i> Explain with Agentary';
  document.body.appendChild(contextButton);
  
  // Function to position the button near selected text
  const positionButton = (rect) => {
    if (!rect) return;
    
    // Position above the selection
    contextButton.style.top = `${window.scrollY + rect.top - 30}px`;
    contextButton.style.left = `${window.scrollX + rect.left}px`;
    
    // Make visible
    contextButton.style.display = "block";
    // Trigger fade in animation
    setTimeout(() => {
      contextButton.style.opacity = "1";
    }, 10);
  };
  
  // Function to hide the button
  const hideButton = () => {
    contextButton.style.opacity = "0";
    // Remove from DOM after fade out animation completes
    setTimeout(() => {
      contextButton.style.display = "none";
    }, 200);
  };
  
  // Function to remove the overlay
  const removeOverlay = () => {
    const overlay = document.querySelector('#agentary-overlay');
    if (overlay) {
      overlay.style.opacity = "0";
      // Remove overlay after animation completes
      setTimeout(() => {
        overlay.remove();
      }, 300);
    }
  };
  
  // Current selected text
  let currentSelectedText = '';
  
  // Create style elements for animations if they don't exist
  const ensureAnimationStyles = () => {
    // Add styles for the spinner animation
    if (!document.querySelector('#spin-animation-style')) {
      const spinStyle = document.createElement('style');
      spinStyle.id = 'spin-animation-style';
      spinStyle.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(spinStyle);
    }
    
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
  };

  // Click handler for the context button
  const handleContextButtonClick = async () => {
    console.log("Explain button clicked"); // Debug log
    
    // Get text from current selection first, then fallback to tracked text
    let selectedText = getSelectedText() || currentSelectedText;
    
    console.log("Text to explain:", selectedText ? selectedText.substring(0, 30) + (selectedText.length > 30 ? '...' : '') : "No text selected"); // Debug log
    
    if (!selectedText) {
      console.error("No text selected when button was clicked.");
      return;
    }
    
    // Check if there's a dialog already in the DOM
    let dialog = document.querySelector('#agentary-explain-dialog');
    
    // Create dialog if it doesn't exist
    if (!dialog) {
      // Remove any existing overlay first
      const existingOverlay = document.querySelector('#agentary-overlay');
      if (existingOverlay) {
        existingOverlay.remove();
      }
      
      // Create overlay
      const overlay = document.createElement("div");
      overlay.id = "agentary-overlay";
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;
      document.body.appendChild(overlay);
      
      // Fade in the overlay
      setTimeout(() => {
        overlay.style.opacity = "1";
      }, 10);
      
      // Close dialog when clicking on overlay
      overlay.addEventListener('click', () => {
        removeOverlay();
        dialog.remove();
      });
      
      dialog = document.createElement("div");
      dialog.id = "agentary-explain-dialog";
      dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 10000;
        width: 500px;
        max-width: 90vw;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      `;
      
      // Prevent clicks on dialog from closing it via the overlay
      dialog.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      
      // Create header
      const header = document.createElement("div");
      header.style.cssText = `
        padding: 16px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      `;
      
      const title = document.createElement("h3");
      title.textContent = "Agentary Explanation";
      title.style.cssText = `
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      `;
      
      const closeBtn = document.createElement("button");
      closeBtn.innerHTML = "×";
      closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
      `;
      closeBtn.onclick = () => {
        removeOverlay();
        dialog.remove();
      };
      
      header.appendChild(title);
      header.appendChild(closeBtn);
      dialog.appendChild(header);
      
      // Create body content
      const body = document.createElement("div");
      body.style.cssText = `
        padding: 16px;
        overflow-y: auto;
        flex-grow: 1;
      `;
      dialog.appendChild(body);
      
      document.body.appendChild(dialog);
      
      // Add keydown listener to close dialog with Escape key
      const escapeKeyHandler = (e) => {
        if (e.key === 'Escape') {
          removeOverlay();
          dialog.remove();
          document.removeEventListener('keydown', escapeKeyHandler);
        }
      };
      document.addEventListener('keydown', escapeKeyHandler);
    }
    
    // Get the dialog body
    const body = dialog.querySelector("div:nth-child(2)");
    
    // Show selected text
    const selectedTextEl = document.createElement("div");
    selectedTextEl.style.cssText = `
      background: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 14px;
      border-left: 3px solid #6366f1;
    `;
    selectedTextEl.textContent = selectedText;
    
    // Create explanation container
    const explanationContainer = document.createElement("div");
    explanationContainer.className = "markdown-content";
    explanationContainer.style.cssText = `
      margin-top: 16px;
      line-height: 1.5;
      font-size: 14px;
    `;
    
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
    
    // Add styles for typing animation if it doesn't exist
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
    
    // Ensure animation styles are created
    ensureAnimationStyles();
    
    // Clear previous content and add new content
    body.innerHTML = '';
    body.appendChild(selectedTextEl);
    
    // Add the explanation container with typing indicator
    explanationContainer.appendChild(typingIndicator);
    body.appendChild(explanationContainer);
    
    try {
      // Call the explain function with streaming
      let explanationText = "";
      
      await explainSelectedText(webLLMClient, selectedText, {
        contentSelector: options.contentSelector,
        onToken: (token) => {
          // Remove typing indicator when first token arrives
          if (explanationText === "") {
            explanationContainer.innerHTML = "";
          }
          
          // Update full text
          explanationText += token;
          
          // Render markdown progressively
          explanationContainer.innerHTML = renderMarkdown(explanationText);
          
          // Scroll to the bottom of the container to show latest text
          body.scrollTop = body.scrollHeight;
        }
      });
      
      // If no text was streamed for some reason
      if (explanationText === "") {
        explanationContainer.innerHTML = "No explanation could be generated. Please try again.";
      }
      
    } catch (error) {
      // Handle error
      explanationContainer.innerHTML = '<div style="color: #e74c3c;">Error generating explanation. Please try again.</div>';
      console.error("Explanation error:", error);
    }
    
    // Hide the context button after clicking
    hideButton();
  };
  
  // Add event listener to the button
  contextButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleContextButtonClick();
  });
  
  // For mouse interactions with the button
  contextButton.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent document mousedown from hiding the button
  });
  
  // Add a debug message to console
  console.log("Agentary context menu initialized - Select text to see the explain button");
  
  // Set up selection monitoring using our helper
  const cleanup = addSelectionMonitor((text, rect) => {
    if (text && !webLLMClient.isModelLoading) {
      currentSelectedText = text;
      positionButton(rect);
      console.log("Text selected:", text.substring(0, 30) + (text.length > 30 ? '...' : ''));
    } else {
      currentSelectedText = '';
      hideButton();
    }
  });
  
  // Add keyboard shortcut for selected text
  const keydownHandler = (e) => {
    // Check for Ctrl+E or Cmd+E (on Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      if (currentSelectedText) {
        handleContextButtonClick();
      }
    }
  };
  
  document.addEventListener('keydown', keydownHandler);
  
  // Clean-up function
  return () => {
    cleanup(); // Clean up selection monitor
    document.removeEventListener('keydown', keydownHandler);
    
    // Remove all event listeners
    const newClickHandler = contextButton.onclick;
    if (newClickHandler) {
      contextButton.removeEventListener('click', newClickHandler);
    }
    
    // Get all event handlers to remove them properly
    const cloneNode = contextButton.cloneNode(true);
    contextButton.parentNode?.replaceChild(cloneNode, contextButton);
    contextButton.remove();
  };
} 