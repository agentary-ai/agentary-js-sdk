import { createDialog } from "./components/dialog.js";
import { createContextMenu } from "./context-menu.js";
// Import Font Awesome CSS for icons
import '@fortawesome/fontawesome-free/css/all.css';

/**
 * Mounts the UI widget and sets up the context menu
 * @param webLLMClient - The Agentary client instance
 * @param position - Button position (bottom-right or bottom-left)
 * @param uiOptions - UI configuration options
 */
export function mountWidget(
  webLLMClient, 
  position = "bottom-right",
  uiOptions = {}
) {
  const button = document.createElement("button");
  button.innerHTML = '<i class="fas fa-robot"></i>';
  button.title = "Agentary Assistant";
  button.style.cssText = `
    position:fixed;
    bottom:1rem;
    ${position === "bottom-right" ? "right:1rem" : "left:1rem"};
    width:3.5rem;
    height:3.5rem;
    border-radius:50%;
    background:#6366f1;
    color:white;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:1.5rem;
    border:none;
    box-shadow:0 4px 10px rgba(0,0,0,0.1);
    cursor:pointer;
    z-index:9999;
    transition:transform 0.3s ease, background-color 0.3s ease;
  `;

  // Initialize button in loading state if model is loading
  if (webLLMClient.isModelLoading) {
    button.disabled = true;
    button.style.cursor = "not-allowed";
    button.style.opacity = "0.7";
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  }

  // Add hover effect
  button.addEventListener("mouseenter", () => {
    if (!webLLMClient.isModelLoading) {
      button.style.transform = "scale(1.05)";
    }
  });
  
  button.addEventListener("mouseleave", () => {
    button.style.transform = "scale(1)";
  });
  
  // Create dialog and get show function
  const { dialog, showDialog } = createDialog(webLLMClient, position, uiOptions);
  
  // Track dialog visibility state
  let isDialogVisible = false;
  
  // Function to toggle dialog visibility
  const toggleDialog = () => {
    if (isDialogVisible) {
      // Hide dialog
      dialog.style.opacity = "0";
      dialog.style.transform = "translateY(20px)";
      
      // Hide after animation completes
      setTimeout(() => {
        dialog.style.display = "none";
      }, 300);
      
      // Update button appearance
      button.innerHTML = '<i class="fas fa-robot"></i>';
      button.title = "Open Agentary Assistant";
      isDialogVisible = false;
    } else {
      // Show dialog
      showDialog();
      
      // Update button appearance
      button.innerHTML = '<i class="fas fa-times"></i>';
      button.title = "Close Agentary Assistant";
      isDialogVisible = true;
    }
  };
  
  // Set up the button click handler
  button.addEventListener("click", toggleDialog);
  
  // Add the button to the body
  document.body.appendChild(button);
  
  // Set up context menu for text selection
  createContextMenu(webLLMClient);

  // Function to update button state based on loading status
  const updateButtonState = (isLoading) => {
    // Only update button appearance when loading state changes
    if (isLoading) {
      button.disabled = true;
      button.style.cursor = "not-allowed";
      button.style.opacity = "0.7";
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    } else {
      button.disabled = false;
      button.style.cursor = "pointer";
      button.style.opacity = "1";
      button.innerHTML = isDialogVisible ? 
        '<i class="fas fa-times"></i>' : 
        '<i class="fas fa-robot"></i>';
    }
  };

  // Set up the model loading callback
  webLLMClient.setModelLoadingCallback(updateButtonState);
}