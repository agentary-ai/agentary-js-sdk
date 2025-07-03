import { h } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';
import { classNames } from '../styles';
import { postMessage } from '../../chat/index';
import { summarizeContent } from '../../summarize/index';
import type { WebLLMClient } from '../../core/llm/WebLLMClient';
import type { Logger } from '../../utils/Logger';
import { ChatCompletionMessageParam } from '@mlc-ai/web-llm';
import { marked } from 'marked';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isStreaming?: boolean;
  streamedContent?: string;
}

interface ChatInterfaceProps {
  isClosing: boolean;
  initialMessage?: string | undefined;
  onClose: () => void;
  webLLMClient: WebLLMClient;
  logger: Logger;
}

export function ChatInterface({ isClosing, initialMessage, onClose, webLLMClient, logger }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Add initial message if provided
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: initialMessage,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages([userMessage]);
      
      // Check if this is a summarization request
      if (initialMessage === 'Summarize this page') {
        setIsSummarizing(true);
        handleSummarization();
      } else {
        // Process initial message with actual LLM
        handleAIResponse(initialMessage, []);
      }
    }
  }, [initialMessage, messages.length]);

  // Auto-scroll to bottom when new messages arrive (but not during streaming)
  useEffect(() => {
    // Only scroll when a new message is added, not during streaming updates
    const lastMessage = messages[messages.length - 1];
    const shouldScroll = !lastMessage?.isStreaming;
    
    if (shouldScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]); // Only depend on message count, not message content

  // Focus input when component mounts (but not if summarizing)
  useEffect(() => {
    if (!isSummarizing) {
      inputRef.current?.focus();
    }
  }, [isSummarizing]);

  // Cancel ongoing operations when component is closing or unmounting
  useEffect(() => {
    if (isClosing && abortControllerRef.current) {
      logger.debug('ChatInterface: Cancelling ongoing operations due to closing');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      
      // Also cancel operations directly on the WebLLM client
      if (webLLMClient && typeof webLLMClient.cancelAllOperations === 'function') {
        webLLMClient.cancelAllOperations();
      }
    }
  }, [isClosing, logger, webLLMClient]);

  // Cancel ongoing operations when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        logger.debug('ChatInterface: Cancelling ongoing operations due to unmount');
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        
        // Also cancel operations directly on the WebLLM client
        if (webLLMClient && typeof webLLMClient.cancelAllOperations === 'function') {
          webLLMClient.cancelAllOperations();
        }
      }
    };
  }, [logger, webLLMClient]);

  const handleSummarization = async () => {
    setIsLoading(true);
    
    // Create abort controller for this operation
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    try {
      // Create placeholder message for streaming
      const aiMessageId = (Date.now() + 1).toString();
      const aiMessage: Message = {
        id: aiMessageId,
        content: '',
        sender: 'assistant',
        timestamp: new Date(),
        isStreaming: true,
        streamedContent: ''
      };
      
      setMessages(prev => [...prev, aiMessage]);

      // Call summarizeContent with streaming
      await summarizeContent(
        webLLMClient,
        {
          streamResponse: true,
          abortSignal: abortController.signal,
          onStreamToken: (token: string) => {
            setMessages(prev => prev.map(msg => {
              if (msg.id === aiMessageId && msg.isStreaming) {
                const newContent = (msg.streamedContent || '') + token;
                return {
                  ...msg,
                  streamedContent: newContent
                };
              }
              return msg;
            }));
          }
        },
        logger
      );

      // Mark streaming as complete
      setMessages(prev => prev.map(msg => {
        if (msg.id === aiMessageId && msg.isStreaming) {
          return {
            ...msg,
            content: msg.streamedContent || '',
            isStreaming: false
          };
        }
        return msg;
      }));

    } catch (error) {
      // Check if this was a cancellation
      if (error instanceof Error && error.message === 'Operation was cancelled') {
        logger.debug('Summarization was cancelled');
        // Remove the placeholder streaming message
        setMessages(prev => prev.filter(msg => !(msg.isStreaming && msg.content === '')));
      } else {
        logger.error('Error summarizing content:', error);
        
        // Add error message
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: 'Sorry, I encountered an error summarizing the page. Please try again.',
          sender: 'assistant',
          timestamp: new Date()
        };
        
        setMessages(prev => {
          // Remove the placeholder streaming message and add error message
          const filteredMessages = prev.filter(msg => !(msg.isStreaming && msg.content === ''));
          return [...filteredMessages, errorMessage];
        });
      }
    } finally {
      setIsLoading(false);
      // Clear the abort controller since operation is complete
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  };

  const handleAIResponse = async (userMessage: string, previousMessages: ChatCompletionMessageParam[]) => {
    setIsLoading(true);
    
    // Create abort controller for this operation
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    try {
      // Create placeholder message for streaming
      const aiMessageId = (Date.now() + 1).toString();
      const aiMessage: Message = {
        id: aiMessageId,
        content: '',
        sender: 'assistant',
        timestamp: new Date(),
        isStreaming: true,
        streamedContent: ''
      };
      
      setMessages(prev => [...prev, aiMessage]);

      // Call postMessage with streaming
      await postMessage(
        webLLMClient,
        userMessage,
        {
          previousMessages,
          streamResponse: true,
          abortSignal: abortController.signal,
          onStreamToken: (token: string) => {
            setMessages(prev => prev.map(msg => {
              if (msg.id === aiMessageId && msg.isStreaming) {
                const newContent = (msg.streamedContent || '') + token;
                return {
                  ...msg,
                  streamedContent: newContent
                };
              }
              return msg;
            }));
          }
        },
        logger
      );

      // Mark streaming as complete
      setMessages(prev => prev.map(msg => {
        if (msg.id === aiMessageId && msg.isStreaming) {
          return {
            ...msg,
            content: msg.streamedContent || '',
            isStreaming: false
          };
        }
        return msg;
      }));

    } catch (error) {
      // Check if this was a cancellation
      if (error instanceof Error && error.message === 'Operation was cancelled') {
        logger.debug('Chat response was cancelled');
        // Remove the placeholder streaming message
        setMessages(prev => prev.filter(msg => !(msg.isStreaming && msg.content === '')));
      } else {
        logger.error('Error processing message:', error);
        
        // Add error message
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          content: 'Sorry, I encountered an error processing your message. Please try again.',
          sender: 'assistant',
          timestamp: new Date()
        };
        
        setMessages(prev => {
          // Remove the placeholder streaming message and add error message
          const filteredMessages = prev.filter(msg => !(msg.isStreaming && msg.content === ''));
          return [...filteredMessages, errorMessage];
        });
      }
    } finally {
      setIsLoading(false);
      // Clear the abort controller since operation is complete
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageContent = inputValue.trim();
    setInputValue('');

    // Build previous messages for context
    const previousMessages: ChatCompletionMessageParam[] = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content
    }));

    handleAIResponse(messageContent, previousMessages);
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getChatClassName = () => {
    const classes = [classNames.chatContainer];
    if (isClosing) {
      classes.push(classNames.slideOut);
    } else {
      classes.push(classNames.slideIn);
    }
    return classes.join(' ');
  };

  const renderMessageContent = (message: Message) => {
    // Render AI messages (both streaming and completed) with markdown support
    if (message.sender === 'assistant') {
      const content = message.isStreaming 
        ? (message.streamedContent || '') 
        : message.content;
      
      let markdownHtml = marked.parse(content, {
        breaks: true, // Convert line breaks to <br>
        gfm: true,    // Enable GitHub Flavored Markdown
      }) as string;
      
      // Add streaming cursor to HTML if message is streaming
      if (message.isStreaming) {
        markdownHtml += `<span class="${classNames.streamingCursor}">|</span>`;
      }
      
      return (
        <div 
          className={classNames.chatMessageContent}
          dangerouslySetInnerHTML={{ __html: markdownHtml }}
        />
      );
    }
    
    // User messages remain as plain text
    return (
      <div className={classNames.chatMessageContent}>
        {message.content}
      </div>
    );
  };

  return (
    <div className={getChatClassName()}>
      {/* Chat Header */}
      <div className={classNames.chatHeader}>
        <button
          className={classNames.chatBackButton}
          onClick={onClose}
          title="Back to prompts"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className={classNames.chatHeaderContent}>
          <div className={classNames.chatTitle}>Chat Assistant</div>
          <div className={classNames.chatSubtitle}>Powered by Agentary</div>
        </div>
      </div>

      {/* Messages */}
      <div className={classNames.chatMessages}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${classNames.chatMessage} ${
              message.sender === 'user' 
                ? classNames.chatMessageUser 
                : classNames.chatMessageAssistant
            }`}
          >
            {renderMessageContent(message)}
          </div>
        ))}
        
        {isLoading && messages.length > 0 && !messages[messages.length - 1]?.isStreaming && (
          <div className={`${classNames.chatMessage} ${classNames.chatMessageAssistant}`}>
            <div className={classNames.chatMessageContent}>
              <div className={classNames.chatTypingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      {!isSummarizing && (
        <div className={classNames.chatInputContainer}>
          <div className={classNames.chatInputRow}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                if (e.currentTarget.value.length > 0) {
                  setSubmitDisabled(false);
                } else {
                  setSubmitDisabled(true)
                }
                setInputValue(e.currentTarget.value)
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className={classNames.chatInput}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={submitDisabled || isLoading}
              className={classNames.chatSendButton}
              title="Send message"
            >
              {isLoading ? (
                <i className={`fas fa-spinner ${classNames.spinner}`}></i>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className={classNames.footer}>
        Powered by Agentary
      </div>
    </div>
  );
} 