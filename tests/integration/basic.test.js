/**
 * @jest-environment jsdom
 */

import { Agentary } from '../../src/index.js';

describe('Integration Tests', () => {
  test('should create SDK instance and emit events', () => {
    const sdk = new Agentary({ apiKey: 'test-key' });
    
    let eventFired = false;
    sdk.on('test-event', () => {
      eventFired = true;
    });

    sdk.emit('test-event');
    expect(eventFired).toBe(true);
  });

  test('should handle logger in debug mode', () => {
    const consoleSpy = jest.spyOn(console, 'debug').mockImplementation();
    
    const sdk = new Agentary({ 
      apiKey: 'test-key',
      debug: true 
    });

    sdk.logger.debug('Test debug message');
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Agentary SDK]',
      '[DEBUG]',
      'Test debug message'
    );

    consoleSpy.mockRestore();
  });
}); 