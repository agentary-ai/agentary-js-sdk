// Copy and paste this entire script into your browser console to test the Agentary SDK

// First, load the SDK (this will create a global Agentary object)
(function() {
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/agentary-js-sdk@latest/dist/agentary.umd.js';
  script.onload = function() {
    console.log('✅ Agentary SDK loaded successfully!');
    
    // Test the SDK
    try {
      // Create SDK instance
      const sdk = new Agentary.Agentary({
        apiKey: 'test-api-key-12345',
        debug: true
      });
      
      console.log('✅ SDK instance created:', sdk);
      console.log('📦 SDK Version:', sdk.getVersion());
      
      // Test event system
      sdk.on('test-event', (data) => {
        console.log('🎉 Event received:', data);
      });
      
      sdk.emit('test-event', { message: 'Hello from Agentary SDK!' });
      
      // Test connection (this will fail since it's a test API key, but shows the flow)
      sdk.testConnection().then(connected => {
        console.log('🔗 Connection test result:', connected);
      }).catch(error => {
        console.log('⚠️ Connection test failed (expected with test key):', error.message);
      });
      
    } catch (error) {
      console.error('❌ Error testing SDK:', error);
    }
  };
  
  script.onerror = function() {
    console.error('❌ Failed to load Agentary SDK from CDN');
    console.log('💡 Alternative: Copy the UMD bundle content directly into console');
  };
  
  document.head.appendChild(script);
})();

// Alternative method: If you want to test with local build, 
// copy the entire content of dist/agentary.umd.js and paste it first,
// then run this:
/*
const sdk = new Agentary.Agentary({
  apiKey: 'your-test-key',
  debug: true
});

console.log('SDK Version:', sdk.getVersion());
sdk.on('test', () => console.log('Event works!'));
sdk.emit('test');
*/ 