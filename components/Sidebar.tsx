'use client';

import { useState, useRef, useEffect } from 'react';
import { Chat, ModelId } from '@/lib/types';

import HardwareDashboard from './HardwareDashboard';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: (model?: ModelId) => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleDelete = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteConfirm === chatId) {
      onDeleteChat(chatId);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(chatId);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleStartRename = (chatId: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(chatId);
    setEditTitle(currentTitle);
    setDeleteConfirm(null);
  };

  const handleConfirmRename = () => {
    if (editingId && editTitle.trim()) {
      onRenameChat(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirmRename();
    } else if (e.key === 'Escape') {
      handleCancelRename();
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Toggle Button — always visible */}
      <button
        id="sidebar-toggle"
        onClick={onToggle}
        className="
          fixed top-4 left-4 z-50
          p-2 rounded-md
          bg-bg-surface border border-border
          text-text-secondary hover:text-text-primary
          hover:bg-bg-surface-hover
          transition-all duration-300
          cursor-pointer
          shadow-soft
        "
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        id="sidebar"
        className={`
          fixed top-0 left-0 z-40
          h-full w-72
          bg-bg-base border-r border-border
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-16 pb-4 border-b border-border">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-1.5 h-1.5 rounded-full bg-text-primary" />
            <h1 className="text-text-primary font-sans text-lg font-semibold tracking-tight truncate">
              LocalGPT
            </h1>
          </div>
          <span className="text-text-muted text-xs font-mono">v1.0</span>
        </div>

        {/* New Chat Button */}
        <div className="px-3 py-3">
          <button
            id="new-chat-button"
            onClick={() => onNewChat()}
            className="
              w-full flex items-center gap-2
              px-3 py-2.5
              bg-bg-surface
              border border-border
              rounded-lg
              text-text-primary text-sm font-medium
              transition-all duration-300
              hover:bg-bg-surface-hover hover:border-border-hover
              active:scale-[0.98]
              cursor-pointer
              shadow-sm
            "
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {chats.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-muted text-xs font-mono">No chats yet</p>
              <p className="text-text-muted text-xs font-mono mt-1">
                Start a new conversation
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => editingId !== chat.id && onSelectChat(chat.id)}
                  className={`
                    group flex items-center gap-2
                    px-3 py-2.5
                    rounded-lg
                    cursor-pointer
                    transition-all duration-200
                    ${activeChatId === chat.id
                      ? 'bg-bg-surface border border-border shadow-sm'
                      : 'hover:bg-bg-surface border border-transparent'
                    }
                  `}
                >
                  {/* Chat icon */}
                  <svg
                    className={`w-4 h-4 flex-shrink-0 ${
                      activeChatId === chat.id ? 'text-text-primary' : 'text-text-muted'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                  </svg>

                  {/* Chat info — inline edit or display */}
                  <div className="flex-1 min-w-0">
                    {editingId === chat.id ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={handleRenameKeyDown}
                        onBlur={handleConfirmRename}
                        className="
                          w-full text-sm
                          bg-bg-surface border border-border-hover
                          rounded px-1.5 py-0.5
                          text-text-primary
                          outline-none
                          font-sans
                          focus:border-text-primary
                        "
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <p
                          className={`text-sm truncate ${
                            activeChatId === chat.id ? 'text-text-primary' : 'text-text-secondary'
                          }`}
                        >
                          {chat.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-text-secondary truncate font-medium">
                            {chat.model.split(':')[0]}
                          </span>
                          <span className="text-text-muted text-xs">
                            {formatDate(chat.updated_at)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action buttons — Rename + Delete */}
                  {editingId !== chat.id && (
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {/* Rename button */}
                      <button
                        onClick={(e) => handleStartRename(chat.id, chat.title, e)}
                        className="
                          p-1 rounded
                          text-text-muted
                          opacity-0 group-hover:opacity-100
                          hover:text-text-primary hover:bg-bg-surface-hover
                          transition-all duration-200
                          cursor-pointer
                        "
                        aria-label="Rename chat"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDelete(chat.id, e)}
                        className={`
                          p-1 rounded
                          transition-all duration-200
                          cursor-pointer
                          ${deleteConfirm === chat.id
                            ? 'text-status-error bg-status-error-bg'
                            : 'text-text-muted opacity-0 group-hover:opacity-100 hover:text-status-error hover:bg-status-error-bg'
                          }
                        `}
                        aria-label={deleteConfirm === chat.id ? 'Confirm delete' : 'Delete chat'}
                      >
                        {deleteConfirm === chat.id ? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Telemetry Footer */}
        <HardwareDashboard />
      </aside>
    </>
  );
}
