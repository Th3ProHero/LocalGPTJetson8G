// TypeScript interfaces for LocalGPT

export interface Chat {
  id: string;
  title: string;
  model: string;
  system_prompt: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream: boolean;
  keep_alive: number;
  options?: {
    repeat_penalty?: number;
    temperature?: number;
    [key: string]: any;
  };
}

export interface OllamaStreamChunk {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export const AVAILABLE_MODELS = [
  { id: 'llama3.2-pro', name: 'Llama 3.2 Pro', description: 'Meta — Optimized parameters' },
  { id: 'phi3:mini', name: 'Phi-3 Mini', description: 'Microsoft — Lightweight & fast' },
] as const;

export type ModelId = typeof AVAILABLE_MODELS[number]['id'];
