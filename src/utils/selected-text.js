/**
 * Gets the currently selected text on the page
 * @returns The selected text or empty string if no selection
 */
export function getSelectedText() {
    // Try multiple approaches to get selected text
    
    // 1. Standard window.getSelection
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const text = selection.toString().trim();
      if (text) return text;
    }
    
    // 2. Check document.selection for IE compatibility
    if (document.hasOwnProperty('selection')) {
      const ieSelection = document.selection;
      if (ieSelection.type !== 'Control') {
        const text = ieSelection.createRange().text.trim();
        if (text) return text;
      }
    }
    
    // 3. Check active element for inputs and textareas
    const activeEl = document.activeElement;
    if (activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement) {
      const start = activeEl.selectionStart;
      const end = activeEl.selectionEnd;
      
      if (start !== null && end !== null && start !== end) {
        const text = activeEl.value.substring(start, end).trim();
        if (text) return text;
      }
    }
    
    // 4. If still nothing, check for frames
    try {
      const frames = window.frames;
      for (let i = 0; i < frames.length; i++) {
        try {
          const frameSelection = frames[i].document.getSelection();
          if (frameSelection && !frameSelection.isCollapsed) {
            const text = frameSelection.toString().trim();
            if (text) return text;
          }
        } catch (e) {
          // Ignore cross-origin frame errors
        }
      }
    } catch (e) {
      // Ignore any frame access errors
    }
    
    // No selection found
    return "";
  }
  