# Agentary SDK Test Page

This test page provides a comprehensive testing environment for the Agentary JavaScript SDK.

## Quick Start

1. **Build the SDK first:**
   ```bash
   npm run build
   ```

2. **Start a local server:**
   ```bash
   npm run serve
   ```

3. **Open the test page:**
   Navigate to `http://localhost:8080/test.html` in your browser.

## Test Features

### 🚀 SDK Initialization
- Tests SDK initialization with various configurations
- Measures initialization time
- Displays configuration settings
- Allows reinitializing the SDK

### 📝 Content Summarization
- Tests the `summarizeContent()` method
- Includes sample content for quick testing
- Allows testing with custom content
- Measures operation performance

### 📡 Event Handling
- Tests the EventEmitter functionality
- Captures and displays SDK events
- Allows manual event testing
- Real-time event logging

### ⚙️ Configuration Testing
- Displays current SDK configuration
- Tests debug mode functionality
- Tests model loading features

### 📊 Performance Metrics
- Tracks initialization and operation times
- Monitors memory usage (Chrome/Edge only)
- Real-time performance monitoring

### 🐛 Debug Console
- Comprehensive logging system
- Color-coded log levels (info, success, error, warning)
- Export logs functionality
- Real-time debug output

## Browser Requirements

- Modern browser with ES6+ support
- For memory metrics: Chrome or Edge browser
- For WebLLM features: Browser with WebAssembly support

## Testing Workflow

1. **Initialize SDK**: Click "Initialize SDK" to start
2. **Test Summarization**: Use either sample or custom content
3. **Monitor Events**: Watch real-time event logging
4. **Check Performance**: Monitor timing and memory metrics
5. **Debug Issues**: Use the debug console for troubleshooting

## Features Tested

- ✅ SDK Initialization (`new AgentaryClient()`)
- ✅ Content Summarization (`summarizeContent()`)
- ✅ Event System (`on()`, `emit()`)
- ✅ Configuration Management
- ✅ Error Handling
- ✅ Performance Monitoring
- ✅ Debug Logging

## Troubleshooting

### SDK Won't Initialize
- Check browser console for errors
- Ensure the SDK build files exist in `./dist/`
- Try refreshing the page

### Summarization Fails
- Ensure the SDK is initialized first
- Check if the WebLLM model is loaded
- Monitor the debug console for error messages

### Performance Issues
- Large models may take time to load
- Check memory usage in performance metrics
- Consider using a smaller model for testing

## Development Notes

- The test page automatically initializes the SDK after 1 second
- Memory metrics update every 5 seconds
- All operations are logged to both the UI and browser console
- The page uses the UMD build from `./dist/agentary.umd.js`

## Customization

You can modify the test page to:
- Add new test scenarios
- Test different SDK configurations
- Add custom content for summarization
- Implement additional SDK methods as they become available

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

Note: Some features like memory metrics are only available in Chromium-based browsers. 