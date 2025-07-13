/**
 * Main styles file - now imports from the modular styles directory
 * This maintains backward compatibility while using the new organized structure
 */

// Re-export everything from the new styles directory
export { 
  injectAgentaryStyles,
  removeAgentaryStyles,
  cssVariables,
  classNames,
  cssStyles
} from './styles/index'; 