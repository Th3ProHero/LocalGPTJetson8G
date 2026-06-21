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
    <div className="border-t border-carbon-border bg-carbon p-4">
      <div
        className={`
          flex items-end gap-3
          bg-carbon-light
          border rounded-xl
          px-4 py-3
          transition-all duration-300
          ${disabled
            ? 'border-carbon-border opacity-70'
            : 'border-carbon-border hover:border-terminal-green-dim focus-within:border-neon-green focus-within:glow-green'
          }
        `}
      >
        {/* Terminal prompt symbol */}
        <span className="text-neon-green font-mono text-sm mb-1 select-none flex-shrink-0">
          {'❯'}
        </span>

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
              rounded-lg
              bg-red-500/10
              border border-red-500/40
              text-red-400
              text-xs font-mono
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
              rounded-lg
              transition-all duration-200
              disabled:opacity-30 disabled:cursor-not-allowed
              enabled:hover:bg-neon-green/10 enabled:hover:glow-green
              enabled:active:scale-95
              cursor-pointer
            "
            aria-label="Send message"
          >
            <svg
              className={`w-5 h-5 transition-colors duration-200 ${
                input.trim() && !disabled ? 'text-neon-green' : 'text-text-muted'
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
      <p className="text-text-muted text-xs mt-2 text-center font-mono">
        {isStreaming ? (
          <>
            <span className="text-red-400">Esc</span> or{' '}
            <span className="text-red-400">Stop</span> to cancel •{' '}
            <span className="text-text-muted">Auto-cancels after 3 min</span>
          </>
        ) : (
          <>
            <span className="text-terminal-green">Enter</span> to send •{' '}
            <span className="text-terminal-green">Shift+Enter</span> for new line
          </>
        )}
      </p>
    </div>
  );
}
