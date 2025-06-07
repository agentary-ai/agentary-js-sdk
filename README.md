# Agentary JavaScript SDK

A modern JavaScript SDK for Agentary, designed specifically for web browsers with support for ES modules, CommonJS, and UMD formats.

## Features

- 🌐 **Browser-first**: Optimized for web browser environments
- 📦 **Multiple formats**: ES modules, CommonJS, and UMD builds
- 🔧 **TypeScript ready**: Includes type definitions
- 🧪 **Well tested**: Comprehensive test suite with Jest
- 📚 **Well documented**: JSDoc comments and examples
- 🎯 **Modern JavaScript**: Uses latest ES features with Babel transpilation
- 🔄 **Event-driven**: Built-in event emitter for reactive programming

## Installation

### Via npm

```bash
npm install agentary-js-sdk
```

### Via CDN (UMD)

```html
<script src="https://cdn.agentary.ai/latest/agentary.umd.js"></script>
```

### ES Modules

```html
<script type="module">
  import { Agentary } from 'https://cdn.agentary.ai/latest/agentary.esm.js';
</script>
```

## Quick Start

### Basic Usage

```javascript
import { Agentary } from 'agentary-js-sdk';

// Initialize the SDK
const agentary = new Agentary({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.agentary.com', // optional
  debug: false // optional
});

// Test the connection
const isConnected = await agentary.testConnection();
console.log('Connected:', isConnected);

// Get SDK version
console.log('Version:', agentary.getVersion());
```

### Analytics Integration

The Agentary SDK includes built-in analytics powered by Mixpanel to help you understand how users interact with your AI widget.

```javascript
import { init } from 'agentary-js-sdk';

// Initialize with analytics
const agentary = init({
  analytics: {
    mixpanelToken: 'your-mixpanel-project-token',
    enabled: true,
    userId: 'user123', // optional
    debug: false // optional
  },
  debug: false,
  loadModel: true,
  showWidget: true
});
```

#### Tracked Events

The SDK automatically tracks the following user interactions:

**Widget Events:**
- `widget_mounted` - When the widget is initialized
- `widget_button_clicked` - When users click the widget button
- `chat_dialog_opened` - When the chat dialog opens
- `chat_dialog_closed` - When the chat dialog closes

**AI Interaction Events:**
- `message_sent` - When users send messages
- `ai_response_received` - When AI responses are received
- `feature_used` - When specific features (explain, summarize) are used

**Context Menu Events:**
- `context_menu_opened` - When text selection triggers context menu
- `context_menu_action` - When users click context menu actions

**Model Events:**
- `model_loading_started` - When AI model loading begins
- `model_loading_completed` - When AI model is ready
- `model_loading_failed` - When model loading fails

**Performance & Error Events:**
- `error_occurred` - When errors happen
- `page_prompts_generated` - When page-specific prompts are created

Each event includes relevant metadata like response times, content length, user context, and page information.

#### Analytics Configuration

```javascript
{
  analytics: {
    mixpanelToken: 'your-token',    // Required for tracking
    enabled: true,                  // Enable/disable tracking (default: true)
    userId: 'user123',             // Optional user identifier
    debug: false                   // Log analytics events to console
  }
}
```

#### Privacy Considerations

- Analytics are enabled by default but can be disabled
- Only interaction data is tracked, not content
- User content is never sent to analytics services
- All tracking respects user privacy and GDPR compliance

### Event Handling

```javascript
// Listen for events
agentary.on('error', (error) => {
  console.error('SDK Error:', error);
});

agentary.on('request', (details) => {
  console.log('API Request:', details);
});

// Emit custom events
agentary.emit('custom-event', { data: 'example' });
```

## API Reference

### Constructor

```javascript
new Agentary(config)
```

**Parameters:**
- `config` (Object): Configuration options
  - `apiKey` (string): Your Agentary API key (required)
  - `baseUrl` (string): Base URL for the API (optional, defaults to 'https://api.agentary.com')
  - `debug` (boolean): Enable debug logging (optional, defaults to false)

### Methods

#### `getVersion()`
Returns the SDK version string.

#### `testConnection()`
Tests the connection to the Agentary API.
- **Returns**: `Promise<boolean>` - Connection status

#### Event Methods
The SDK extends EventEmitter, so you can use:
- `on(event, listener)` - Add event listener
- `off(event, listener)` - Remove event listener
- `once(event, listener)` - Add one-time event listener
- `emit(event, ...args)` - Emit event

## Development

### Setup

```bash
# Install dependencies
npm install

# Run tests (TODO)
npm test

# Run tests in watch mode (TODO)
npm run test:watch

# Build the SDK
npm run build

# Build for development (unminified)
npm run build:dev

# Build for production (minified)
npm run build:prod

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Generate documentation
npm run docs
```

### Project Structure

```
agentary-js-sdk/
├── src/                    # Source code
│   ├── core/              # Core functionality
│   │   ├── ApiClient.js   # HTTP client
│   │   └── index.js       # Core exports
│   ├── utils/             # Utility functions
│   │   ├── EventEmitter.js # Event handling
│   │   ├── Logger.js      # Logging utility
│   │   └── index.js       # Utility exports
│   └── index.js           # Main entry point
├── tests/                 # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── setup.js          # Test setup
├── examples/             # Usage examples
├── dist/                 # Built files (generated)
├── docs/                 # Documentation
└── config files...       # Various config files
```

### Building

The SDK is built using Rollup and creates three different bundles:

- **ES Module** (`dist/agentary.esm.js`): For modern bundlers and `<script type="module">`
- **CommonJS** (`dist/agentary.js`): For Node.js and older bundlers
- **UMD** (`dist/agentary.umd.js`): For direct browser usage via `<script>` tag

### Testing

Tests are written using Jest and run in a jsdom environment to simulate browser APIs.

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test -- --coverage

# Run specific test file
npm test -- tests/unit/Agentary.test.js
```

## Browser Compatibility

The SDK supports all modern browsers:

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

For older browser support, the UMD build includes necessary polyfills.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@agentary.com
- 📖 Documentation: [https://docs.agentary.com](https://docs.agentary.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/agentary-js-sdk/issues) 


----

const script = document.createElement('script');
script.src = 'https://cdn.agentary.ai/latest/agentary.umd.js';
document.head.appendChild(script);

const a = window.Agentary.init({ loadModel: true, showWidget: true, generateQuestions: true, maxQuestions: 5, contentSelector: '.a-content' })

----

// Quick test of the improved worker creation
(async function() {
  console.log("🔧 Testing Improved Worker Creation...");
  
  // Test if Agentary SDK is available
  if (typeof Agentary !== 'undefined') {
    console.log("✅ Agentary SDK detected");
    
    // Create SDK instance
    const sdk = new Agentary.AgentarySDK({ loadModel: false });
    console.log("✅ SDK instance created");
    
    // Check initial worker status
    console.log("📊 Initial worker status:", sdk.webLLMClient.getWorkerStatus());
    
    // Test engine creation (this will use the improved worker creation)
    try {
      console.log("🔄 Testing engine creation with improved worker strategies...");
      await sdk.webLLMClient.createEngine();
      console.log("✅ Engine created successfully!");
      
      // Check final worker status
      const finalStatus = sdk.webLLMClient.getWorkerStatus();
      console.log("📊 Final worker status:", finalStatus);
      
      if (finalStatus.hasWorker && finalStatus.workerVerified) {
        console.log("🎉 SUCCESS: Worker created and verified!");
      } else if (!finalStatus.hasWorker) {
        console.log("ℹ️ INFO: Fell back to main thread (no worker)");
      } else {
        console.log("⚠️ WARNING: Worker created but not verified");
      }
      
    } catch (error) {
      console.log("❌ Engine creation failed:", error.message);
    }
  } else {
    console.log("❌ Agentary SDK not found. Load it first!");
  }
})();