'use client';

import { useRef, useState, useEffect } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  onCancel?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
}

export default function ChatInput({
  onSend,
  onCancel,
  disabled = false,
  isStreaming = false,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const maxHeight = 6 * 24; // ~6 lines
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  }, [input]);

  // Re-focus input after streaming ends
  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isStreaming]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Escape to cancel during streaming
    if (e.key === 'Escape' && isStreaming && onCancel) {
      e.preventDefault();
      onCancel();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-transparent p-4">
      <div
        className={`
          flex items-end gap-3
          bg-bg-surface
          border rounded-2xl
          px-4 py-3
          transition-all duration-300
          shadow-sm
          ${disabled
            ? 'border-border opacity-70'
            : 'border-border focus-within:border-border-hover focus-within:shadow-soft'
          }
        `}
      >

        <textarea
          ref={textareaRef}
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isStreaming ? 'Generating response... press Esc or Stop to cancel' : 'Type your message...'}
          disabled={disabled && !isStreaming}
          rows={1}
          className="
            flex-1
            bg-transparent
            text-text-primary
            placeholder-text-muted
            text-sm
            resize-none
            outline-none
            font-sans
            leading-6
            max-h-[144px]
          "
        />

        {/* Stop button (during streaming) or Send button */}
        {isStreaming ? (
          <button
            id="stop-button"
            onClick={onCancel}
            className="
              flex-shrink-0
              flex items-center gap-1.5
              px-3 py-1.5
              rounded-full
              bg-bg-surface-hover
              border border-border
              text-text-primary
              text-xs font-sans font-medium
              transition-all duration-200
              hover:bg-red-500/20 hover:border-red-500
              active:scale-95
              cursor-pointer
            "
            aria-label="Stop generation"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
            Stop
          </button>
        ) : (
          <button
            id="send-button"
            onClick={handleSubmit}
            disabled={disabled || !input.trim()}
            className="
              flex-shrink-0
              p-2
              rounded-full
              transition-all duration-200
              disabled:opacity-30 disabled:cursor-not-allowed
              enabled:hover:bg-bg-surface-hover
              enabled:active:scale-95
              cursor-pointer
            "
            aria-label="Send message"
          >
            <svg
              className={`w-5 h-5 transition-colors duration-200 ${
                input.trim() && !disabled ? 'text-text-primary' : 'text-text-muted'
              }`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Hint */}
      <p className="text-text-muted text-[11px] mt-2 text-center font-sans">
        {isStreaming ? (
          <>
            <span className="text-text-secondary font-medium">Esc</span> or{' '}
            <span className="text-text-secondary font-medium">Stop</span> to cancel •{' '}
            <span className="text-text-muted">Auto-cancels after 3 min</span>
          </>
        ) : (
          <>
            <span className="text-text-secondary font-medium">Enter</span> to send •{' '}
            <span className="text-text-secondary font-medium">Shift+Enter</span> for new line
          </>
        )}
      </p>
    </div>
  );
}
