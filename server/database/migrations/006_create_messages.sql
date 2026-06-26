-- ==========================================================
-- ShadowDock Database Migration
-- Migration: 006_create_messages.sql
-- Description: Create messages table
-- ==========================================================

CREATE TABLE IF NOT EXISTS messages (

    ----------------------------------------------------------
    -- Internal Identifier
    ----------------------------------------------------------

    id UUID PRIMARY KEY
        DEFAULT gen_random_uuid(),

    ----------------------------------------------------------
    -- Public Identifier
    -- Example:
    -- msg_A82KDF91XQ
    ----------------------------------------------------------

    public_id VARCHAR(20)
        NOT NULL
        UNIQUE,

    ----------------------------------------------------------
    -- Relationships
    ----------------------------------------------------------

    chat_id UUID
        NOT NULL,

    sender_id UUID
        NOT NULL,

    ----------------------------------------------------------
    -- Public Sender Snapshot
    -- (survives username changes)
    ----------------------------------------------------------

    sender_public_id VARCHAR(20)
        NOT NULL,

    ----------------------------------------------------------
    -- Message Information
    ----------------------------------------------------------

    message_type VARCHAR(20)
        NOT NULL
        DEFAULT 'text',

    content TEXT,

    ----------------------------------------------------------
    -- Rich Metadata
    -- Future Ready
    ----------------------------------------------------------

    metadata JSONB
        NOT NULL
        DEFAULT '{}'::jsonb,

    ----------------------------------------------------------
    -- Reply System
    ----------------------------------------------------------

    reply_to_message_id UUID,

    ----------------------------------------------------------
    -- Thread Support
    ----------------------------------------------------------

    thread_root_message_id UUID,

    ----------------------------------------------------------
    -- Forward System
    ----------------------------------------------------------

    forwarded_from_message_id UUID,

    forwarded_from_chat_id UUID,

    forwarded_from_user_id UUID,

    ----------------------------------------------------------
    -- Scheduling
    ----------------------------------------------------------

    scheduled_at TIMESTAMPTZ,

    ----------------------------------------------------------
    -- Expiring Messages
    ----------------------------------------------------------

    expires_at TIMESTAMPTZ,

    ----------------------------------------------------------
    -- Pinning
    ----------------------------------------------------------

    pinned BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    pinned_at TIMESTAMPTZ,

    pinned_by UUID,

    ----------------------------------------------------------
    -- Delivery Status
    ----------------------------------------------------------

    delivery_status VARCHAR(20)
        NOT NULL
        DEFAULT 'sending',

    delivered_at TIMESTAMPTZ,

    read_at TIMESTAMPTZ,

    failed_at TIMESTAMPTZ,

    failure_reason TEXT,
        ----------------------------------------------------------
    -- Encryption (Future Ready)
    ----------------------------------------------------------

    encrypted BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    encryption_version SMALLINT,

    message_nonce TEXT,

    encrypted_key TEXT,

    encryption_algorithm VARCHAR(50),

    ----------------------------------------------------------
    -- Message Generator
    ----------------------------------------------------------

    generator_type VARCHAR(20)
        NOT NULL
        DEFAULT 'user',

    generator_id UUID,

    generator_name VARCHAR(64),

    ----------------------------------------------------------
    -- Message Editing
    ----------------------------------------------------------

    edited BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    edit_count INTEGER
        NOT NULL
        DEFAULT 0,

    edited_at TIMESTAMPTZ,

    last_editor_id UUID,

    ----------------------------------------------------------
    -- Message State
    ----------------------------------------------------------

    deleted_at TIMESTAMPTZ,

    deleted_by UUID,

    deleted_for_everyone BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    restored_at TIMESTAMPTZ,

    restored_by UUID,

    ----------------------------------------------------------
    -- Reactions / Views
    ----------------------------------------------------------

    reaction_count INTEGER
        NOT NULL
        DEFAULT 0,

    reply_count INTEGER
        NOT NULL
        DEFAULT 0,

    forward_count INTEGER
        NOT NULL
        DEFAULT 0,

    view_count INTEGER
        NOT NULL
        DEFAULT 0,

    ----------------------------------------------------------
    -- Flags
    ----------------------------------------------------------

    is_system_message BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    is_silent BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    is_spoiler BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    is_edited BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    ----------------------------------------------------------
    -- Audit Information
    ----------------------------------------------------------

    created_by UUID,

    updated_by UUID,

    ----------------------------------------------------------
    -- Metadata
    ----------------------------------------------------------

    created_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    ----------------------------------------------------------
    -- Relationships
    ----------------------------------------------------------

    FOREIGN KEY (chat_id)
        REFERENCES chats(id)
        ON DELETE CASCADE,

    FOREIGN KEY (sender_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (reply_to_message_id)
        REFERENCES messages(id)
        ON DELETE SET NULL,

    FOREIGN KEY (thread_root_message_id)
        REFERENCES messages(id)
        ON DELETE SET NULL,

    FOREIGN KEY (forwarded_from_message_id)
        REFERENCES messages(id)
        ON DELETE SET NULL,

    FOREIGN KEY (forwarded_from_chat_id)
        REFERENCES chats(id)
        ON DELETE SET NULL,

    FOREIGN KEY (forwarded_from_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    FOREIGN KEY (pinned_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    FOREIGN KEY (last_editor_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    FOREIGN KEY (deleted_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    FOREIGN KEY (restored_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON DELETE SET NULL

);
-- ==========================================================
-- Validation Constraints
-- ==========================================================

--------------------------------------------------------------
-- Message Type Validation
--------------------------------------------------------------

ALTER TABLE messages
ADD CONSTRAINT chk_message_type
CHECK (
    message_type IN (
        'text',
        'image',
        'video',
        'audio',
        'voice',
        'document',
        'gif',
        'sticker',
        'emoji',
        'poll',
        'location',
        'contact',
        'system',
        'call',
        'reply',
        'forward',
        'deleted',
        'bot'
    )
);

--------------------------------------------------------------
-- Delivery Status Validation
--------------------------------------------------------------

ALTER TABLE messages
ADD CONSTRAINT chk_delivery_status
CHECK (
    delivery_status IN (
        'sending',
        'queued',
        'sent',
        'delivered',
        'read',
        'failed',
        'expired'
    )
);

--------------------------------------------------------------
-- Generator Type Validation
--------------------------------------------------------------

ALTER TABLE messages
ADD CONSTRAINT chk_generator_type
CHECK (
    generator_type IN (
        'user',
        'bot',
        'ai',
        'system',
        'automation'
    )
);

--------------------------------------------------------------
-- Encryption Validation
--------------------------------------------------------------

ALTER TABLE messages
ADD CONSTRAINT chk_encryption_version
CHECK (
    encryption_version IS NULL
    OR encryption_version >= 1
);

--------------------------------------------------------------
-- Counter Validation
--------------------------------------------------------------

ALTER TABLE messages
ADD CONSTRAINT chk_reaction_count
CHECK (reaction_count >= 0);

ALTER TABLE messages
ADD CONSTRAINT chk_reply_count
CHECK (reply_count >= 0);

ALTER TABLE messages
ADD CONSTRAINT chk_forward_count
CHECK (forward_count >= 0);

ALTER TABLE messages
ADD CONSTRAINT chk_view_count
CHECK (view_count >= 0);

ALTER TABLE messages
ADD CONSTRAINT chk_edit_count
CHECK (edit_count >= 0);

--------------------------------------------------------------
-- Timestamp Validation
--------------------------------------------------------------

ALTER TABLE messages
ADD CONSTRAINT chk_schedule_time
CHECK (
    scheduled_at IS NULL
    OR scheduled_at >= created_at
);

ALTER TABLE messages
ADD CONSTRAINT chk_expiry_time
CHECK (
    expires_at IS NULL
    OR expires_at >= created_at
);

ALTER TABLE messages
ADD CONSTRAINT chk_edit_time
CHECK (
    edited_at IS NULL
    OR edited_at >= created_at
);

ALTER TABLE messages
ADD CONSTRAINT chk_delete_time
CHECK (
    deleted_at IS NULL
    OR deleted_at >= created_at
);

ALTER TABLE messages
ADD CONSTRAINT chk_restore_time
CHECK (
    restored_at IS NULL
    OR deleted_at IS NOT NULL
);

--------------------------------------------------------------
-- Content Validation
--------------------------------------------------------------

ALTER TABLE messages
ADD CONSTRAINT chk_message_content
CHECK (
    content IS NOT NULL
    OR metadata <> '{}'::jsonb
);

--------------------------------------------------------------
-- Forward Validation
--------------------------------------------------------------

ALTER TABLE messages
ADD CONSTRAINT chk_forward_reference
CHECK (
    forwarded_from_message_id IS NULL
    OR forwarded_from_chat_id IS NOT NULL
);

--------------------------------------------------------------
-- Thread Validation
--------------------------------------------------------------

ALTER TABLE messages
ADD CONSTRAINT chk_thread_reference
CHECK (
    thread_root_message_id IS NULL
    OR thread_root_message_id <> id
);

--------------------------------------------------------------
-- Public ID Validation
--------------------------------------------------------------

ALTER TABLE messages
ADD CONSTRAINT chk_public_message_id
CHECK (
    public_id LIKE 'msg_%'
);
-- ==========================================================
-- Indexes
-- ==========================================================

--------------------------------------------------------------
-- Primary Lookup
--------------------------------------------------------------

CREATE INDEX idx_messages_public_id
ON messages(public_id);

--------------------------------------------------------------
-- Chat Timeline
--------------------------------------------------------------

CREATE INDEX idx_messages_chat
ON messages(chat_id);

CREATE INDEX idx_messages_chat_created
ON messages(chat_id, created_at DESC);

--------------------------------------------------------------
-- Sender History
--------------------------------------------------------------

CREATE INDEX idx_messages_sender
ON messages(sender_id);

CREATE INDEX idx_messages_sender_created
ON messages(sender_id, created_at DESC);

--------------------------------------------------------------
-- Message Type
--------------------------------------------------------------

CREATE INDEX idx_messages_type
ON messages(message_type);

--------------------------------------------------------------
-- Delivery Status
--------------------------------------------------------------

CREATE INDEX idx_messages_delivery
ON messages(delivery_status);

--------------------------------------------------------------
-- Threads
--------------------------------------------------------------

CREATE INDEX idx_messages_reply
ON messages(reply_to_message_id);

CREATE INDEX idx_messages_thread
ON messages(thread_root_message_id);

--------------------------------------------------------------
-- Forwarding
--------------------------------------------------------------

CREATE INDEX idx_messages_forward
ON messages(forwarded_from_message_id);

--------------------------------------------------------------
-- Scheduling
--------------------------------------------------------------

CREATE INDEX idx_messages_schedule
ON messages(scheduled_at)
WHERE scheduled_at IS NOT NULL;

--------------------------------------------------------------
-- Expiring Messages
--------------------------------------------------------------

CREATE INDEX idx_messages_expiry
ON messages(expires_at)
WHERE expires_at IS NOT NULL;

--------------------------------------------------------------
-- Edited Messages
--------------------------------------------------------------

CREATE INDEX idx_messages_edited
ON messages(edited_at)
WHERE edited_at IS NOT NULL;

--------------------------------------------------------------
-- Deleted Messages
--------------------------------------------------------------

CREATE INDEX idx_messages_deleted
ON messages(deleted_at)
WHERE deleted_at IS NOT NULL;

--------------------------------------------------------------
-- Pinned Messages
--------------------------------------------------------------

CREATE INDEX idx_messages_pinned
ON messages(chat_id)
WHERE pinned = TRUE;

--------------------------------------------------------------
-- AI / Bot Messages
--------------------------------------------------------------

CREATE INDEX idx_messages_generator
ON messages(generator_type);

--------------------------------------------------------------
-- Encryption
--------------------------------------------------------------

CREATE INDEX idx_messages_encrypted
ON messages(encrypted);

--------------------------------------------------------------
-- Audit
--------------------------------------------------------------

CREATE INDEX idx_messages_created
ON messages(created_at);

CREATE INDEX idx_messages_updated
ON messages(updated_at);

--------------------------------------------------------------
-- JSONB Metadata
--------------------------------------------------------------

CREATE INDEX idx_messages_metadata
ON messages
USING GIN (metadata);

--------------------------------------------------------------
-- Composite Performance Indexes
--------------------------------------------------------------

CREATE INDEX idx_messages_chat_status
ON messages(chat_id, delivery_status);

CREATE INDEX idx_messages_chat_type
ON messages(chat_id, message_type);

CREATE INDEX idx_messages_chat_sender
ON messages(chat_id, sender_id);

--------------------------------------------------------------
-- Future Full-Text Search
--------------------------------------------------------------

CREATE INDEX idx_messages_content_search
ON messages
USING GIN (
    to_tsvector(
        'simple',
        COALESCE(content, '')
    )
);

-- ==========================================================
-- Notes
--
-- One row represents one logical message.
--
-- Attachments are stored separately.
--
-- Reactions are stored separately.
--
-- Read receipts are stored separately.
--
-- Notifications are stored separately.
--
-- The message table only stores
-- message-specific information.
--
-- Future features supported:
--
-- ✓ AI Messages
-- ✓ Bot Messages
-- ✓ Scheduled Messages
-- ✓ Expiring Messages
-- ✓ Reply Threads
-- ✓ Forwarded Messages
-- ✓ E2EE
-- ✓ Media Attachments
-- ✓ Message Editing
-- ✓ Soft Delete
-- ✓ Search
-- ✓ Translation
-- ✓ OCR
-- ✓ Speech-to-Text
-- ✓ Message Summaries
--
-- Built for Everyone.
-- Controlled by No One.
--
-- ==========================================================