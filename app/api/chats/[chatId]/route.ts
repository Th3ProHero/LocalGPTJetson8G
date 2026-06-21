import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ chatId: string }>;
}

/**
 * GET /api/chats/[chatId]
 * Fetch a single chat's metadata.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { chatId } = await params;

    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[GET /api/chats/[chatId]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/chats/[chatId]
 * Update a chat's title or model.
 * Body: { title?: string, model?: string }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { chatId } = await params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('chats')
      .update(body)
      .eq('id', chatId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('[PATCH /api/chats/[chatId]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update chat' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chats/[chatId]
 * Delete a chat and all its messages (cascade).
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { chatId } = await params;

    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/chats/[chatId]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat' },
      { status: 500 }
    );
  }
}
