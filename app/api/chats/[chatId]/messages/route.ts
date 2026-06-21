import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ chatId: string }>;
}

/**
 * GET /api/chats/[chatId]/messages
 * Fetch all messages for a chat, ordered chronologically.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { chatId } = await params;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('[GET /api/chats/[chatId]/messages] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
