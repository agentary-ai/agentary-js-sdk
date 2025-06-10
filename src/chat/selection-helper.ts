// /**
//  * Selection helper to more reliably detect text selections in various contexts
//  */

// /**
//  * Adds a selection monitor to the page that provides more reliable selection detection
//  * @param callback Function to call when text is selected
//  * @returns Cleanup function
//  */
// export function addSelectionMonitor(
//   callback: (text: string, rect: DOMRect | null) => void
// ) {
//   // Store current selection to detect changes
//   let lastSelectionText = '';
  
//   // Function to get selection info
//   const getSelectionInfo = (): { text: string, rect: DOMRect | null } => {
//     let selText = '';
//     let selRect = null;
    
//     // Get selection from window
//     const selection = window.getSelection();
//     if (selection && !selection.isCollapsed) {
//       selText = selection.toString().trim();
//       if (selText && selection.rangeCount > 0) {
//         selRect = selection.getRangeAt(0).getBoundingClientRect();
//       }
//     }
    
//     // Return selection info
//     return { text: selText, rect: selRect };
//   };
  
//   // Handler for all possible selection events
//   const checkSelection = () => {
//     // Small delay to ensure selection is complete
//     setTimeout(() => {
//       const { text, rect } = getSelectionInfo();
      
//       // Only trigger callback if selection changed
//       if (text && text !== lastSelectionText) {
//         lastSelectionText = text;
//         callback(text, rect);
//       } else if (!text && lastSelectionText) {
//         // Selection was cleared - add a slightly longer delay for deselection
//         // to avoid losing selection when user tries to click the button
//         setTimeout(() => {
//           // Check again to make sure the text is still deselected
//           const { text: currentText } = getSelectionInfo();
//           if (!currentText) {
//             lastSelectionText = '';
//             callback('', null); // Call callback with empty text to notify deselection
//           }
//         }, 300); // 300ms delay before reporting deselection
//       }
//     }, 50);
//   };
  
//   // Create a transparent overlay to detect selection interactions
//   const overlay = document.createElement('div');
//   overlay.style.cssText = `
//     position: fixed;
//     top: 0;
//     left: 0;
//     width: 100%;
//     height: 100%;
//     pointer-events: none;
//     z-index: -1;
//   `;
//   document.body.appendChild(overlay);
  
//   // Attach multiple event listeners to catch all selection methods
//   document.addEventListener('mouseup', checkSelection);
//   document.addEventListener('keyup', checkSelection);
//   document.addEventListener('selectionchange', checkSelection);
  
//   // For touch devices
//   document.addEventListener('touchend', checkSelection);
  
//   // Initial check
//   setTimeout(checkSelection, 500);
  
//   // Cleanup function
//   return () => {
//     document.removeEventListener('mouseup', checkSelection);
//     document.removeEventListener('keyup', checkSelection);
//     document.removeEventListener('selectionchange', checkSelection);
//     document.removeEventListener('touchend', checkSelection);
//     overlay.remove();
//   };
// } 