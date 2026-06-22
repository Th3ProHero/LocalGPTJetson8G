'use client';

import { useRef, useEffect } from 'react';
import { Message, ModelId } from '@/lib/types';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import ModelSelector from './ModelSelector';

interface ChatAreaProps {
  messages: Message[];
  chatTitle: string;
  model: ModelId;
  isStreaming: boolean;
  streamingContent: string;
  onSendMessage: (content: string) => void;
  onModelChange: (model: ModelId) => void;
  onCancelStream: () => void;
  sidebarOpen: boolean;
}

export default function ChatArea({
  messages,
  chatTitle,
  model,
  isStreaming,
  streamingContent,
  onSendMessage,
  onModelChange,
  onCancelStream,
  sidebarOpen,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive or streaming content updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  return (
    <div
      className={`
        flex flex-col h-screen
        transition-all duration-300
        ${sidebarOpen ? 'lg:ml-72' : 'ml-0'}
      `}
    >
      {/* Header Bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-base/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3 ml-14 lg:ml-0">
          <h2 className="text-text-primary text-sm font-semibold tracking-tight truncate max-w-[200px] sm:max-w-[400px]">
            {chatTitle}
          </h2>
          {isStreaming && (
            <span className="text-xs font-sans text-text-muted animate-pulse">
              streaming...
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <ModelSelector
            value={model}
            onChange={onModelChange}
            disabled={isStreaming}
          />
        </div>
      </header>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Streaming message (in progress) */}
          {isStreaming && streamingContent && (
            <MessageBubble
              message={{
                id: 'streaming',
                chat_id: '',
                role: 'assistant',
                content: streamingContent,
                created_at: new Date().toISOString(),
              }}
              isStreaming={true}
            />
          )}

          {/* Typing indicator (before content starts) */}
          {isStreaming && !streamingContent && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="max-w-3xl mx-auto w-full">
        <ChatInput
          onSend={onSendMessage}
          onCancel={onCancelStream}
          disabled={isStreaming}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}
