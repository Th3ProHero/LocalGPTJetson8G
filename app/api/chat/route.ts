import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchOllamaStream } from '@/lib/ollama';
import { OllamaMessage, OllamaStreamChunk } from '@/lib/types';

/**
 * Maximum duration for this route (in seconds).
 * Covers Jetson cold-start (5-8s) + full generation time.
 * Prevents Next.js from timing out the streaming response.
 */
export const maxDuration = 300; // 5 minutes

/**
 * POST /api/chat
 *
 * Streaming proxy to Ollama running on NVIDIA Jetson (192.168.0.111:11434).
 * 1. Receives { model, messages, chatId } from the client
 * 2. Saves the user message to Supabase
 * 3. Forwards to Ollama with keep_alive: 0
 * 4. Streams NDJSON chunks back as a ReadableStream
 * 5. On completion, saves the full assistant response to Supabase
 */
export async function POST(request: NextRequest) {
  try {
    const { model, messages, chatId } = await request.json();

    if (!model || !messages || !chatId) {
      return NextResponse.json(
        { error: 'Missing required fields: model, messages, chatId' },
        { status: 400 }
      );
    }

    // Save the latest user message to Supabase
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.role === 'user') {
      await supabase.from('messages').insert({
        chat_id: chatId,
        role: 'user',
        content: lastUserMessage.content,
      });
    }

    // Build the Ollama message history
    const ollamaMessages: OllamaMessage[] = messages.map(
      (msg: { role: string; content: string }) => ({
        role: msg.role as OllamaMessage['role'],
        content: msg.content,
      })
    );

    // Fetch streaming response from Ollama (Jetson)
    const ollamaResponse = await fetchOllamaStream(model, ollamaMessages);

    if (!ollamaResponse.body) {
      return NextResponse.json(
        { error: 'No response body from Ollama' },
        { status: 502 }
      );
    }

    // Create a TransformStream to process NDJSON chunks
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let fullResponse = '';

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = decoder.decode(chunk, { stream: true });
        const lines = text.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          try {
            const parsed: OllamaStreamChunk = JSON.parse(line);

            if (parsed.message?.content) {
              fullResponse += parsed.message.content;
              controller.enqueue(encoder.encode(parsed.message.content));
            }

            // When the stream is complete, save the full assistant response
            if (parsed.done) {
              if (fullResponse.trim()) {
                await supabase.from('messages').insert({
                  chat_id: chatId,
                  role: 'assistant',
                  content: fullResponse,
                });
              }
            }
          } catch {
            // Skip malformed JSON lines (partial chunks)
          }
        }
      },
    });

    // Pipe Ollama's stream through our transform
    ollamaResponse.body.pipeThrough(transformStream);

    return new Response(transformStream.readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[/api/chat] Error:', error);

    const message =
      error instanceof Error ? error.message : 'Internal server error';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
