'use client';

import { AVAILABLE_MODELS, ModelId } from '@/lib/types';

interface EmptyStateProps {
  onNewChat: (model: ModelId) => void;
}

export default function EmptyState({ onNewChat }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      {/* ASCII Art Logo */}
      <pre className="text-neon-green text-xs sm:text-sm font-mono text-glow-green mb-6 select-none leading-tight border-none bg-transparent !p-0">
{`
 ██╗      ██████╗  ██████╗ █████╗ ██╗      
 ██║     ██╔═══██╗██╔════╝██╔══██╗██║      
 ██║     ██║   ██║██║     ███████║██║      
 ██║     ██║   ██║██║     ██╔══██║██║      
 ███████╗╚██████╔╝╚██████╗██║  ██║███████╗ 
 ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝ 
           ██████╗ ██████╗ ████████╗        
          ██╔════╝ ██╔══██╗╚══██╔══╝        
          ██║  ███╗██████╔╝   ██║           
          ██║   ██║██╔═══╝    ██║           
          ╚██████╔╝██║        ██║           
           ╚═════╝ ╚═╝        ╚═╝           
`}
      </pre>

      {/* Tagline */}
      <p className="text-text-secondary text-sm font-mono mb-2">
        <span className="text-terminal-green">$</span> Private AI inference on your local network
      </p>
      <p className="text-text-muted text-xs font-mono mb-8">
        Running on NVIDIA Jetson • No cloud • No tracking
      </p>

      {/* Model Quick Select */}
      <div className="flex flex-col sm:flex-row gap-3">
        {AVAILABLE_MODELS.map((model) => (
          <button
            key={model.id}
            onClick={() => onNewChat(model.id)}
            className="
              group
              flex flex-col items-start
              bg-carbon-light
              border border-carbon-border
              rounded-lg
              px-5 py-4
              transition-all duration-300
              hover:border-neon-green hover:glow-green
              cursor-pointer
              min-w-[200px]
            "
          >
            <span className="text-text-primary text-sm font-medium group-hover:text-neon-green transition-colors">
              {model.name}
            </span>
            <span className="text-text-muted text-xs mt-1">
              {model.description}
            </span>
            <span className="text-neon-green text-xs font-mono mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              → Start chat
            </span>
          </button>
        ))}
      </div>

      {/* Footer hint */}
      <p className="text-text-muted text-xs font-mono mt-8">
        Press{' '}
        <kbd className="px-1.5 py-0.5 bg-carbon-lighter border border-carbon-border rounded text-text-secondary text-xs">
          Ctrl
        </kbd>{' '}
        +{' '}
        <kbd className="px-1.5 py-0.5 bg-carbon-lighter border border-carbon-border rounded text-text-secondary text-xs">
          N
        </kbd>{' '}
        to start a new chat
      </p>
    </div>
  );
}
