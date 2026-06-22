'use client';

import { AVAILABLE_MODELS, ModelId } from '@/lib/types';

interface ModelSelectorProps {
  value: ModelId;
  onChange: (model: ModelId) => void;
  disabled?: boolean;
}

export default function ModelSelector({
  value,
  onChange,
  disabled = false,
}: ModelSelectorProps) {
  return (
    <div className="relative">
      <select
        id="model-selector"
        value={value}
        onChange={(e) => onChange(e.target.value as ModelId)}
        disabled={disabled}
        className="
          appearance-none
          bg-bg-surface
          border border-border
          text-text-secondary text-sm
          font-sans font-medium
          rounded-lg
          px-3 py-1.5 pr-8
          cursor-pointer
          transition-all duration-200
          hover:bg-bg-surface-hover hover:border-border-hover hover:text-text-primary
          focus:outline-none focus:border-text-primary
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-sm
        "
      >
        {AVAILABLE_MODELS.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
      {/* Custom dropdown arrow */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <svg
          className="h-4 w-4 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>
    </div>
  );
}
