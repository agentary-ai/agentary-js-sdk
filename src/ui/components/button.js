/**
 * Creates the floating chat button
 */
export function createButton(
  corner,
  onClick
) {
  const btn = document.createElement("button");
  
  // Create icon element
  const icon = document.createElement("i");
  icon.className = "fas fa-robot";
  btn.appendChild(icon);
  
  btn.style.cssText = `
    position:fixed;
    ${corner === "bottom-right" ? "right:1.5rem" : "left:1.5rem"};
    bottom:1.5rem;
    width:3.5rem;
    height:3.5rem;
    display:flex;
    align-items:center;
    justify-content:center;
    border:none;
    border-radius:50%;
    background:#6366f1;
    color:#fff;
    box-shadow:0 6px 16px rgba(0,0,0,0.15), 0 10px 24px rgba(99,102,241,0.2);
    z-index:9999;`;

  btn.onclick = onClick;
  
  return btn;
} 