# UI Components

This directory contains the user interface components for the Agentary SDK, built with Preact.

## Styling Architecture

The UI components use a **CSS-in-JS** approach with programmatic style injection to ensure compatibility when embedded in host websites. This approach avoids conflicts with existing CSS and provides better encapsulation.

### Key Features

- **🎨 CSS Custom Properties**: All design tokens are defined as CSS custom properties for easy theming
- **📱 Responsive Design**: Mobile-first responsive design with breakpoints
- **🌙 Dark Mode Support**: Automatic dark mode detection with `prefers-color-scheme`
- **♿ Accessibility**: WCAG-compliant with focus management and reduced motion support
- **🔒 Scoped Styles**: All CSS classes are prefixed with `agentary-` to prevent conflicts
- **⚡ Performance**: Styles are only injected once and cleaned up when widgets are unmounted

### Design System

The design system is defined in `src/ui/styles.ts` and includes:

#### Color Palette
- **Primary**: `#007bff` (Blue)
- **Text**: `#333` (Dark gray)
- **Muted**: `#666` (Medium gray)
- **Background**: `#ffffff` (White)
- **Border**: `#e1e5e9` (Light gray)

#### Spacing Scale
- `xs`: 4px
- `sm`: 8px  
- `md`: 12px
- `lg`: 16px
- `xl`: 20px

#### Typography
- `sm`: 12px
- `md`: 14px (base)
- `lg`: 18px
- `xl`: 24px

#### Animations
- **Fast**: 0.2s ease
- **Medium**: 0.3s ease
- **Bounce**: cubic-bezier(0.34, 1.56, 0.64, 1)

### Components

#### Popup Component (`Popup.tsx`)

The main UI component that renders:
- **Floating Action Button**: A circular button that toggles the popup
- **Modal Dialog**: The main interface with header, content, and footer
- **Loading States**: Spinner animations during model loading
- **Responsive Layout**: Adapts to mobile screens

### Usage

```tsx
import { Popup } from './Popup';
import { injectAgentaryStyles, removeAgentaryStyles } from './styles';

// Inject styles when mounting
useEffect(() => {
  injectAgentaryStyles();
  
  return () => {
    // Cleanup styles when unmounting (if needed)
    removeAgentaryStyles();
  };
}, []);

// Use the component
<Popup 
  webLLMClient={client}
  widgetOptions={options}
  onClose={handleClose}
/>
```

### Best Practices

1. **Always use the classNames object** from `styles.ts` instead of hardcoding class names
2. **Inject styles early** in the component lifecycle
3. **Clean up styles** when the last widget is unmounted
4. **Use CSS custom properties** for any new design tokens
5. **Prefix all new classes** with `agentary-` to avoid conflicts
6. **Test in dark mode** and with reduced motion preferences
7. **Ensure responsive behavior** on mobile devices

### Customization

To customize the appearance:

1. **Update CSS custom properties** in `styles.ts`
2. **Modify the `cssVariables` object** for design tokens
3. **Add new CSS classes** to the `cssStyles` string
4. **Export new class names** in the `classNames` object

Example:
```ts
// Add a new design token
const cssVariables = {
  // ... existing variables
  '--agentary-accent-color': '#28a745',
};

// Add new CSS classes
const cssStyles = `
  // ... existing styles
  .agentary-accent-button {
    background-color: var(--agentary-accent-color);
    /* ... other styles */
  }
`;

// Export the class name
export const classNames = {
  // ... existing class names
  accentButton: 'agentary-accent-button',
};
```

### Browser Support

- **Modern browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **CSS Custom Properties**: Required (supported in all modern browsers)
- **CSS Grid/Flexbox**: Used for layouts
- **Media Queries**: Used for responsive design and accessibility features 