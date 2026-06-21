-- ============================================
-- LocalGPT Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Table: chats (conversation sessions)
CREATE TABLE chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'New Chat',
    model TEXT NOT NULL DEFAULT 'llama3.2:latest',
    system_prompt TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: messages (individual messages within a chat)
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at ASC);
CREATE INDEX idx_chats_updated_at ON chats(updated_at DESC);

-- Auto-update updated_at on chats when a new message is inserted
CREATE OR REPLACE FUNCTION update_chat_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chats SET updated_at = now() WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_timestamp
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_chat_timestamp();

-- Auto-generate chat title from first user message (first 80 chars)
CREATE OR REPLACE FUNCTION auto_title_chat()
RETURNS TRIGGER AS $$
DECLARE
    msg_count INT;
BEGIN
    IF NEW.role = 'user' THEN
        SELECT COUNT(*) INTO msg_count FROM messages WHERE chat_id = NEW.chat_id;
        IF msg_count = 0 THEN
            UPDATE chats
            SET title = LEFT(NEW.content, 80)
            WHERE id = NEW.chat_id AND title = 'New Chat';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_title_chat
BEFORE INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION auto_title_chat();
