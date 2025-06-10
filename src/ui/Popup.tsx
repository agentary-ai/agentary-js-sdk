import { h } from 'preact';
import { useState } from 'preact/hooks';
import type { WebLLMClient } from '../core/WebLLMClient';
import type { WidgetOptions } from '../types/index';

interface PopupProps {
  webLLMClient: WebLLMClient;
  widgetOptions: WidgetOptions;
  onClose?: () => void;
}

export function Popup({ webLLMClient, widgetOptions, onClose }: PopupProps) {
  const [isVisible, setIsVisible] = useState(widgetOptions.autoOpenOnLoad || false);

  const handleToggle = () => {
    setIsVisible(!isVisible);
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  return (
    <div style={{ pointerEvents: 'auto' }}>
      {/* Floating Action Button */}
      {!isVisible && (
        <button
          onClick={handleToggle}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease',
            zIndex: 10000,
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.transform = 'scale(1)';
          }}
          title="Open Agentary"
        >
          <i className="fas fa-robot"></i>
        </button>
      )}

      {/* Popup Dialog */}
      {isVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '400px',
            height: '600px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e1e5e9',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10000,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e1e5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8f9fa',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-robot" style={{ color: '#007bff', fontSize: '20px' }}></i>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#333' }}>
                Agentary Assistant
              </h3>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#666',
                padding: '4px',
                borderRadius: '4px',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = '#e9ecef';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'transparent';
              }}
              title="Close"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Content */}
          <div
            style={{
              flex: 1,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: '#666',
            }}
          >
            <i className="fas fa-cog fa-spin" style={{ fontSize: '48px', marginBottom: '16px', color: '#007bff' }}></i>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#333' }}>
              Assistant Ready
            </h4>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
              This is a placeholder popup component. The AI assistant will be integrated here.
            </p>
            {widgetOptions.generatePagePrompts && (
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', fontSize: '12px' }}>
                <i className="fas fa-lightbulb" style={{ marginRight: '6px', color: '#ffc107' }}></i>
                Page prompts generation is enabled
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid #e1e5e9',
              backgroundColor: '#f8f9fa',
              fontSize: '12px',
              color: '#666',
              textAlign: 'center',
            }}
          >
            Powered by Agentary
          </div>
        </div>
      )}
    </div>
  );
} 