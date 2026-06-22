'use client';

import { AVAILABLE_MODELS, ModelId } from '@/lib/types';

interface EmptyStateProps {
  onNewChat: (model: ModelId) => void;
}

export default function EmptyState({ onNewChat }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      {/* Minimal Logo / Greeting */}
      <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-2xl bg-bg-surface border border-border shadow-soft">
        <svg className="w-8 h-8 text-text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      </div>
      
      <h2 className="text-xl font-sans font-semibold text-text-primary mb-2 tracking-tight">
        How can I help you today?
      </h2>

      {/* Tagline */}
      <p className="text-text-secondary text-sm mb-12 text-center max-w-sm">
        Private AI inference running locally on NVIDIA Jetson. No cloud, no tracking.
      </p>

      {/* Model Quick Select */}
      <div className="flex flex-col sm:flex-row gap-4">
        {AVAILABLE_MODELS.map((model) => (
          <button
            key={model.id}
            onClick={() => onNewChat(model.id)}
            className="
              group
              flex flex-col items-start
              bg-bg-surface
              border border-border
              rounded-xl
              px-5 py-4
              transition-all duration-300
              hover:bg-bg-surface-hover hover:border-border-hover
              cursor-pointer
              min-w-[220px]
              shadow-sm
            "
          >
            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-text-primary text-sm font-semibold tracking-tight transition-colors">
                {model.name}
              </span>
              <svg className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors opacity-0 group-hover:opacity-100 transform translate-x-[-8px] group-hover:translate-x-0 transition-all duration-300" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
            <span className="text-text-secondary text-xs text-left leading-relaxed">
              {model.description}
            </span>
          </button>
        ))}
      </div>

      {/* Footer hint */}
      <p className="text-text-muted text-xs font-sans mt-12">
        Press{' '}
        <kbd className="px-1.5 py-0.5 bg-bg-surface border border-border rounded text-text-secondary text-xs shadow-sm">
          Ctrl
        </kbd>{' '}
        +{' '}
        <kbd className="px-1.5 py-0.5 bg-bg-surface border border-border rounded text-text-secondary text-xs shadow-sm">
          N
        </kbd>{' '}
        to start a new chat
      </p>
    </div>
  );
}
