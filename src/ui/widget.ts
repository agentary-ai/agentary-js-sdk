import { createDialog } from "./components/dialog";
import { createContextMenu } from "./context-menu";
import { WebLLMClient } from "../core/WebLLMClient";
import { getAnalytics } from "../utils/Analytics";
import type { WidgetOptions } from "../types/index";
import { Logger } from "../utils/Logger";

/** 
 * Injects Font Awesome CSS into the page
 */
function injectFontAwesome() {
  // Check if Font Awesome is already loaded
  if (document.querySelector('link[href*="fontawesome"]') || 
      document.querySelector('style[data-fontawesome]')) {
    return;
  }

  // Create and inject Font Awesome CSS link
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
  link.integrity = 'sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==';
  link.crossOrigin = 'anonymous';
  link.referrerPolicy = 'no-referrer';
  document.head.appendChild(link);
}

/**
 * Mounts the UI widget and sets up the context menu
 * @param webLLMClient - The Agentary client instance
 * @param widgetOptions - UI configuration options
 * @param logger - The logger instance
 */
export function mountWidget(
  webLLMClient: WebLLMClient, 
  widgetOptions: WidgetOptions = {},
  logger: Logger
) {
  // Extract options with default values
  const { 
    position = "bottom-right",
    autoOpenOnLoad = false, 
    ...otherOptions 
  } = widgetOptions;

  const analytics = getAnalytics();

  // Track widget mounting
  analytics?.track('widget_mounted', {
    auto_open: autoOpenOnLoad,
    generate_page_prompts: widgetOptions.generatePagePrompts || false,
    page_url: window.location.href,
    page_domain: window.location.hostname,
  });

  // Inject Font Awesome CSS
  injectFontAwesome();

  const button = document.createElement("button");
  button.innerHTML = '<i class="fas fa-brain"></i>';
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
  if (webLLMClient.modelLoading) {
    button.disabled = true;
    button.style.cursor = "not-allowed";
    button.style.opacity = "0.7";
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  }

  // Add hover effect
  button.addEventListener("mouseenter", () => {
    if (!webLLMClient.modelLoading) {
      button.style.transform = "scale(1.05)";
    }
  });
  
  button.addEventListener("mouseleave", () => {
    button.style.transform = "scale(1)";
  });
  
  // Create dialog and get show function
  const { dialog, showDialog } = createDialog(webLLMClient, {
    position,
    ...otherOptions,
  }, logger);
  
  // Track dialog visibility state
  let isDialogVisible = false;
  let dialogOpenTime = 0;
  let messagesSentInSession = 0;
  
  // Track if this is the first time the model finishes loading
  let hasModelLoadedOnce = false;
  
  // Function to toggle dialog visibility
  const toggleDialog = () => {
    if (isDialogVisible) {
      // Track dialog closing
      analytics?.track('chat_dialog_closed', {
        session_length_ms: Date.now() - dialogOpenTime,
        messages_sent: messagesSentInSession,
        page_url: window.location.href,
        page_domain: window.location.hostname,
      });

      // Hide dialog
      dialog.style.opacity = "0";
      dialog.style.transform = "translateY(20px)";
      
      // Hide after animation completes
      setTimeout(() => {
        dialog.style.display = "none";
      }, 300);
      
      // Update button appearance
      button.innerHTML = '<i class="fas fa-brain"></i>';
      button.title = "Open Agentary Assistant";
      isDialogVisible = false;
      messagesSentInSession = 0;
    } else {
      // Track dialog opening
      dialogOpenTime = Date.now();
      analytics?.track('chat_dialog_opened', {
        trigger: hasModelLoadedOnce && autoOpenOnLoad ? 'auto_open' : 'manual',
        model_loaded: !webLLMClient.modelLoading,
        page_url: window.location.href,
        page_domain: window.location.hostname,
      });

      // Show dialog
      showDialog();
      
      // Update button appearance
      button.innerHTML = '<i class="fas fa-times"></i>';
      button.title = "Close Agentary Assistant";
      isDialogVisible = true;
    }
  };
  
  // Set up the button click handler
  button.addEventListener("click", () => {
    // Track button click
    analytics?.track('widget_button_clicked', {
      action: isDialogVisible ? 'close' : 'open',
      page_url: window.location.href,
      page_domain: window.location.hostname,
      model_loaded: !webLLMClient.modelLoading,
    });

    toggleDialog();
  });
  
  // Add the button to the body
  document.body.appendChild(button);
  
  // Set up context menu for text selection
  createContextMenu(webLLMClient, { 
    ...(otherOptions.contentSelector && { contentSelector: otherOptions.contentSelector })
  }, logger);

  // Function to update button state based on loading status
  const updateButtonState = (isLoading: boolean) => {
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
        '<i class="fas fa-brain"></i>';
      
      // Auto-open dialog when model finishes loading for the first time
      if (autoOpenOnLoad && !hasModelLoadedOnce && !isDialogVisible) {
        hasModelLoadedOnce = true;
        // Add a small delay to ensure the button state update is complete
        setTimeout(() => {
          toggleDialog();
        }, 100);
      } else if (!hasModelLoadedOnce) {
        hasModelLoadedOnce = true;
      }
    }
  };

  // Set up the model loading callback
  webLLMClient.setOnModelLoadingChange(updateButtonState);
}