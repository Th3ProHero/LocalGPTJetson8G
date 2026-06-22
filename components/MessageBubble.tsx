'use client';

import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '@/lib/types';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export default function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Custom code theme overrides
  const customCodeTheme = useMemo(() => ({
    ...vscDarkPlus,
    'pre[class*="language-"]': {
      ...vscDarkPlus['pre[class*="language-"]'],
      background: '#09090b', // bg-bg-base
      margin: 0,
      padding: '1rem',
    },
    'code[class*="language-"]': {
      ...vscDarkPlus['code[class*="language-"]'],
      background: '#09090b',
    },
  }), []);

  return (
    <div
      className={`
        group flex gap-3
        ${isUser ? 'justify-end' : 'justify-start'}
      `}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-bg-surface border border-border flex items-center justify-center mt-1 shadow-sm">
          <svg className="w-4 h-4 text-text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
          </svg>
        </div>
      )}

      {/* Message Content */}
      <div
        className={`
          relative max-w-[85%] px-5 py-3.5 text-[15px] leading-relaxed font-sans
          ${isUser
            ? 'bg-bg-surface-hover rounded-2xl rounded-tr-sm text-text-primary shadow-sm'
            : 'bg-transparent text-text-primary'
          }
        `}
      >
        {/* Copy button — appears on hover */}
        <button
          onClick={() => copyToClipboard(message.content)}
          className="
            absolute -top-3 -right-3
            opacity-0 group-hover:opacity-100
            bg-bg-surface border border-border shadow-sm
            rounded-full p-1.5
            text-text-muted hover:text-text-primary hover:bg-bg-surface-hover
            transition-all duration-200
            cursor-pointer
          "
          aria-label="Copy message"
        >
          {copied ? (
            <svg className="w-3.5 h-3.5 text-text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
          )}
        </button>

        {/* Markdown Rendering for assistant, plain text for user */}
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');

                  if (match) {
                    return (
                      <div className="relative group/code my-4 overflow-hidden rounded-xl border border-border shadow-sm">
                        {/* Language badge */}
                        <div className="absolute top-0 left-0 right-0 flex items-center justify-between bg-bg-surface px-4 py-1.5 border-b border-border">
                          <span className="text-xs font-mono text-text-secondary">
                            {match[1]}
                          </span>
                          <button
                            onClick={() => copyToClipboard(codeString)}
                            className="text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer font-medium"
                          >
                            {copied ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <div className="pt-8 bg-bg-base">
                          <SyntaxHighlighter
                            style={customCodeTheme}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              borderRadius: '0 0 12px 12px',
                              border: 'none',
                              backgroundColor: 'transparent',
                            }}
                          >
                            {codeString}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
            {/* Streaming cursor */}
            {isStreaming && (
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-text-primary ml-1 animate-pulse align-middle" />
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-bg-surface-hover border border-border flex items-center justify-center mt-1 shadow-sm">
          <svg className="w-4 h-4 text-text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
      )}
    </div>
  );
}
