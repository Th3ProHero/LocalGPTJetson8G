'use client';

import { useState, useEffect } from 'react';

/**
 * Terminal-style cold-boot loading indicator.
 * Cycles through hacker-themed status messages to communicate
 * the 5-8 second Jetson cold-start delay to the user.
 */

const BOOT_MESSAGES = [
  { text: 'Connecting to inference node...', delay: 0 },
  { text: 'Allocating memory...', delay: 1800 },
  { text: 'Loading neural network weights...', delay: 3500 },
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
    <div className="flex justify-start opacity-100 transition-opacity duration-300">
      <div className="bg-transparent px-2 py-1 max-w-[80%]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-text-primary animate-pulse" />
          <span className="text-[11px] font-sans font-medium text-text-secondary uppercase tracking-wider">
            System Status
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
                className="flex items-start gap-2.5 transition-opacity duration-300"
              >
                {/* Status indicator */}
                <span className="text-xs font-sans mt-[3px] flex-shrink-0">
                  {isComplete ? (
                    <svg className="w-3 h-3 text-text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <div className="w-3 h-3 rounded-full border-2 border-border border-t-text-primary animate-spin" />
                  )}
                </span>

                {/* Message text */}
                <span
                  className={`text-xs font-sans font-medium leading-relaxed ${
                    isLatest ? 'text-text-primary' : 'text-text-muted'
                  }`}
                >
                  {msg.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 bg-border rounded-full overflow-hidden w-48">
          <div
            className="h-full bg-text-primary rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${(visibleCount / BOOT_MESSAGES.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
