'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Chat, Message, ModelId } from '@/lib/types';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import EmptyState from '@/components/EmptyState';

// Auto-cancel timeout: 3 minutes
const AUTO_CANCEL_MS = 3 * 60 * 1000;

export default function Home() {
  // State
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentModel, setCurrentModel] = useState<ModelId>('llama3.2-pro');

  // Abort controller ref for cancelling streaming
  const abortControllerRef = useRef<AbortController | null>(null);
  const autoCancelTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get active chat metadata
  const activeChat = chats.find((c) => c.id === activeChatId);

  // ─── Fetch chats list ────────────────────────────────────────
  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch('/api/chats');
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  }, []);

  // ─── Fetch messages for active chat ──────────────────────────
  const fetchMessages = useCallback(async (chatId: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  }, []);

  // Load chats on mount
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
    } else {
      setMessages([]);
    }
  }, [activeChatId, fetchMessages]);

  // Cleanup abort controller and timer on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      if (autoCancelTimerRef.current) clearTimeout(autoCancelTimerRef.current);
    };
  }, []);

  // ─── Keyboard shortcut: Ctrl+N for new chat ─────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentModel]);

  // ─── Create new chat ─────────────────────────────────────────
  const handleNewChat = async (model?: ModelId) => {
    try {
      const selectedModel = model || currentModel;
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: selectedModel }),
      });

      if (res.ok) {
        const newChat = await res.json();
        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(newChat.id);
        setMessages([]);
        setCurrentModel(selectedModel);
        if (window.innerWidth < 1024) {
          setSidebarOpen(false);
        }
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  // ─── Select existing chat ────────────────────────────────────
  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setCurrentModel(chat.model as ModelId);
    }
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  // ─── Delete chat ─────────────────────────────────────────────
  const handleDeleteChat = async (chatId: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}`, { method: 'DELETE' });
      if (res.ok) {
        setChats((prev) => prev.filter((c) => c.id !== chatId));
        if (activeChatId === chatId) {
          setActiveChatId(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  // ─── Rename chat ─────────────────────────────────────────────
  const handleRenameChat = async (chatId: string, newTitle: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        setChats((prev) =>
          prev.map((c) => (c.id === chatId ? { ...c, title: newTitle } : c))
        );
      }
    } catch (error) {
      console.error('Failed to rename chat:', error);
    }
  };

  // ─── Change model ────────────────────────────────────────────
  const handleModelChange = async (model: ModelId) => {
    setCurrentModel(model);
    if (activeChatId) {
      try {
        await fetch(`/api/chats/${activeChatId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model }),
        });
        setChats((prev) =>
          prev.map((c) => (c.id === activeChatId ? { ...c, model } : c))
        );
      } catch (error) {
        console.error('Failed to update model:', error);
      }
    }
  };

  // ─── Cancel / Abort streaming ────────────────────────────────
  const handleCancelStream = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    if (autoCancelTimerRef.current) {
      clearTimeout(autoCancelTimerRef.current);
      autoCancelTimerRef.current = null;
    }
    // Keep whatever content was already streamed as a partial response
    setIsStreaming(false);
    setStreamingContent((prev) => {
      if (prev.trim()) {
        const partialMessage: Message = {
          id: `partial-${Date.now()}`,
          chat_id: activeChatId || '',
          role: 'assistant',
          content: prev + '\n\n⚠️ *Response cancelled by user.*',
          created_at: new Date().toISOString(),
        };
        setMessages((msgs) => [...msgs, partialMessage]);
      }
      return '';
    });
  }, [activeChatId]);

  // ─── Send message & stream response ──────────────────────────
  const handleSendMessage = async (content: string) => {
    if (!activeChatId || isStreaming) return;

    // Optimistically add user message to UI
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      chat_id: activeChatId,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setStreamingContent('');

    // Create AbortController for this request
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Auto-cancel after 3 minutes if still waiting
    autoCancelTimerRef.current = setTimeout(() => {
      if (abortControllerRef.current === controller) {
        console.warn('[LocalGPT] Auto-cancelling after 3 minutes');
        handleCancelStream();
      }
    }, AUTO_CANCEL_MS);

    try {
      // Build message history for context
      const messageHistory = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user' as const, content },
      ];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: currentModel,
          messages: messageHistory,
          chatId: activeChatId,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      // Clear auto-cancel once stream starts
      if (autoCancelTimerRef.current) {
        clearTimeout(autoCancelTimerRef.current);
        autoCancelTimerRef.current = null;
      }

      // Read the stream
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            fullContent += chunk;
            setStreamingContent(fullContent);
          }
        } catch (readError) {
          // If aborted during read, handle gracefully
          if (readError instanceof DOMException && readError.name === 'AbortError') {
            return; // Already handled by handleCancelStream
          }
          throw readError;
        }
      }

      // Add the complete assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        chat_id: activeChatId,
        role: 'assistant',
        content: fullContent,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Update chat title in sidebar if it was the first message
      if (messages.length === 0) {
        const newTitle = content.substring(0, 80);
        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChatId
              ? { ...c, title: newTitle, updated_at: new Date().toISOString() }
              : c
          )
        );
      } else {
        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChatId
              ? { ...c, updated_at: new Date().toISOString() }
              : c
          )
        );
      }
    } catch (error) {
      // If aborted, the handleCancelStream already handled state
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        chat_id: activeChatId,
        role: 'assistant',
        content: `⚠️ Error: ${error instanceof Error ? error.message : 'Failed to get response. Check if the Jetson is online.'}`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      abortControllerRef.current = null;
      if (autoCancelTimerRef.current) {
        clearTimeout(autoCancelTimerRef.current);
        autoCancelTimerRef.current = null;
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-void-black">
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {activeChatId ? (
          <ChatArea
            messages={messages}
            chatTitle={activeChat?.title || 'New Chat'}
            model={currentModel}
            isStreaming={isStreaming}
            streamingContent={streamingContent}
            onSendMessage={handleSendMessage}
            onModelChange={handleModelChange}
            onCancelStream={handleCancelStream}
            sidebarOpen={sidebarOpen}
          />
        ) : (
          <div
            className={`
              flex h-screen
              transition-all duration-300
              ${sidebarOpen ? 'lg:ml-72' : 'ml-0'}
            `}
          >
            <EmptyState onNewChat={handleNewChat} />
          </div>
        )}
      </main>
    </div>
  );
}
