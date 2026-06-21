'use client';

import { useState, useEffect } from 'react';

/**
 * Terminal-style cold-boot loading indicator.
 * Cycles through hacker-themed status messages to communicate
 * the 5-8 second Jetson cold-start delay to the user.
 */

const BOOT_MESSAGES = [
  { text: 'Establishing secure link to inference node...', delay: 0 },
  { text: 'Allocating CUDA memory blocks...', delay: 1800 },
  { text: 'Loading neural network weights into VRAM...', delay: 3500 },
  { text: 'Initializing attention layers...', delay: 5200 },
  { text: 'Model loaded. Generating response...', delay: 7000 },
];

export default function TypingIndicator() {
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    BOOT_MESSAGES.forEach((msg, index) => {
      if (index === 0) return; // First message shows immediately
      const timer = setTimeout(() => {
        setVisibleCount(index + 1);
      }, msg.delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex justify-start animate-matrix-fade-in">
      <div className="bg-carbon-light border border-carbon-border rounded-xl px-4 py-3 max-w-[80%]">
        {/* Terminal header */}
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-carbon-border">
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span className="text-xs font-mono text-terminal-green">
            jetson@192.168.0.111
          </span>
        </div>

        {/* Boot sequence messages */}
        <div className="space-y-1">
          {BOOT_MESSAGES.slice(0, visibleCount).map((msg, index) => {
            const isLatest = index === visibleCount - 1;
            const isComplete = index < visibleCount - 1;

            return (
              <div
                key={index}
                className="flex items-start gap-2 animate-matrix-fade-in"
              >
                {/* Status indicator */}
                <span className="text-xs font-mono mt-0.5 flex-shrink-0">
                  {isComplete ? (
                    <span className="text-neon-green">✓</span>
                  ) : (
                    <span className="text-cyber-purple animate-pulse">▸</span>
                  )}
                </span>

                {/* Message text */}
                <span
                  className={`text-xs font-mono leading-relaxed ${
                    isLatest ? 'text-text-primary' : 'text-text-muted'
                  }`}
                >
                  {msg.text}
                  {isLatest && (
                    <span className="inline-block w-1.5 h-3.5 bg-neon-green ml-1 animate-blink align-middle" />
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-0.5 bg-carbon-lighter rounded-full overflow-hidden">
          <div
            className="h-full bg-neon-green/60 rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${(visibleCount / BOOT_MESSAGES.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
