import { h } from 'preact';
import { classNames } from '../styles';

interface PageSummaryProps {
  summary: string;
  isGeneratingSummary: boolean;
  summaryError: string | null;
  showSummary: boolean;
}

export function PageSummary({ 
  summary, 
  isGeneratingSummary, 
  summaryError, 
  showSummary 
}: PageSummaryProps) {
  // Only render if there's summary content, loading state, or error
  if (!isGeneratingSummary && !showSummary && !summaryError) {
    return null;
  }

  return (
    <div className={`${classNames.questionInputContainer}`}>            
      {isGeneratingSummary && !summary && (
        <div className="agentary-summary-loading">
          <i className={`fas fa-circle-notch ${classNames.spinner}`}></i>
          <span style={{ marginLeft: '8px', fontSize: '14px', color: 'var(--agentary-text-muted)' }}>
            Generating summary...
          </span>
        </div>
      )}
      
      {summary && (
        <div className={`agentary-summary-content ${showSummary ? classNames.fadeIn : ''}`}>
          {summary}
          {isGeneratingSummary && (
            <span className={classNames.streamingCursor}>|</span>
          )}
        </div>
      )}
      
      {summaryError && (
        <div className="agentary-summary-error">
          <i className="fas fa-exclamation-triangle" style={{ marginRight: '6px', color: '#dc3545' }}></i>
          {summaryError}
        </div>
      )}
    </div>
  );
} 