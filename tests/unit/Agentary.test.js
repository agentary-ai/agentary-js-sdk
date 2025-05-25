/**
 * @jest-environment jsdom
 */

import { Agentary } from '../../src/index.js';

// Mock fetch for testing
global.fetch = jest.fn();

describe('Agentary SDK', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('Constructor', () => {
    test('should throw error when no API key provided', () => {
      expect(() => new Agentary()).toThrow('API key is required');
    });

    test('should create instance with valid API key', () => {
      const sdk = new Agentary({ apiKey: 'test-key' });
      expect(sdk).toBeInstanceOf(Agentary);
      expect(sdk.config.apiKey).toBe('test-key');
    });

    test('should use default configuration', () => {
      const sdk = new Agentary({ apiKey: 'test-key' });
      expect(sdk.config.baseUrl).toBe('https://api.agentary.com');
      expect(sdk.config.debug).toBe(false);
    });

    test('should override default configuration', () => {
      const sdk = new Agentary({
        apiKey: 'test-key',
        baseUrl: 'https://custom.api.com',
        debug: true
      });
      expect(sdk.config.baseUrl).toBe('https://custom.api.com');
      expect(sdk.config.debug).toBe(true);
    });
  });

  describe('Methods', () => {
    let sdk;

    beforeEach(() => {
      sdk = new Agentary({ apiKey: 'test-key' });
    });

    test('should return version', () => {
      expect(sdk.getVersion()).toBe('1.0.0');
    });

    test('should test connection successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' })
      });

      const result = await sdk.testConnection();
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.agentary.com/health',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key'
          })
        })
      );
    });

    test('should handle connection test failure', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await sdk.testConnection();
      expect(result).toBe(false);
    });
  });
}); 