import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/chats
 * List all chats ordered by most recently updated.
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('[GET /api/chats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chats
 * Create a new chat session.
 * Body: { model?: string, title?: string, system_prompt?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, title, system_prompt } = body;

    const { data, error } = await supabase
      .from('chats')
      .insert({
        model: model || 'llama3.2:latest',
        title: title || 'New Chat',
        system_prompt: system_prompt || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('[POST /api/chats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
}
