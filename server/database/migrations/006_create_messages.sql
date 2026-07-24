-- ============================================================
-- ShadowDock Database Migration
-- Migration : 006_create_messages.sql
-- Description : Create messages table
--
-- Purpose
--     Stores every message sent inside ShadowDock.
--
-- Supported Features
--     • Text Messages
--     • Images
--     • Videos
--     • Voice Notes
--     • Audio
--     • Documents
--     • GIFs
--     • Stickers
--     • Polls
--     • Replies
--     • Threads
--     • Forwarded Messages
--     • Scheduled Messages
--     • Self Destruct Messages
--     • AI Messages
--     • Bot Messages
--     • Future E2EE
--
-- Design Principles
--     • UUID internal IDs
--     • Public IDs for APIs
--     • Soft deletion
--     • Forward compatible
--     • Horizontally scalable
-- ============================================================

CREATE TABLE IF NOT EXISTS messages (

    -- ========================================================
    -- Internal Identifier
    -- ========================================================

    id UUID
        PRIMARY KEY
        DEFAULT gen_random_uuid(),

    -- ========================================================
    -- Public Identifier
    --
    -- Example:
    -- msg_A82KDF91XQ
    -- ========================================================

    public_id VARCHAR(32)
        NOT NULL
        UNIQUE,

    -- ========================================================
    -- Relationships
    -- ========================================================

    chat_id UUID
        NOT NULL,

    sender_id UUID
        NOT NULL,

    -- ========================================================
    -- Public Sender Snapshot
    --
    -- Survives username changes.
    -- ========================================================

    sender_public_id VARCHAR(32)
        NOT NULL,

    -- ========================================================
    -- Message Information
    -- ========================================================

    message_type VARCHAR(20)
        NOT NULL
        DEFAULT 'text',

    content TEXT,

    -- ========================================================
    -- Rich Metadata
    -- ========================================================

    metadata JSONB
        NOT NULL
        DEFAULT '{}'::jsonb,

    -- ========================================================
    -- Reply System
    -- ========================================================

    reply_to_message_id UUID,

    -- ========================================================
    -- Thread Support
    -- ========================================================

    thread_root_message_id UUID,

    -- ========================================================
    -- Forwarding
    -- ========================================================

    forwarded_from_message_id UUID,

    forwarded_from_chat_id UUID,

    forwarded_from_user_id UUID,

    -- ========================================================
    -- Scheduling
    -- ========================================================

    scheduled_at TIMESTAMPTZ,

    -- ========================================================
    -- Expiring Messages
    -- ========================================================

    expires_at TIMESTAMPTZ,

    -- ========================================================
    -- Pinning
    -- ========================================================

    pinned BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    pinned_at TIMESTAMPTZ,

    pinned_by UUID,

    -- ========================================================
    -- Delivery State
    -- ========================================================

    delivery_status VARCHAR(20)
        NOT NULL
        DEFAULT 'sending',

    delivered_at TIMESTAMPTZ,

    read_at TIMESTAMPTZ,

    failed_at TIMESTAMPTZ,

    failure_reason TEXT,

    -- ========================================================
    -- Encryption
    -- ========================================================

    encrypted BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    encryption_version SMALLINT,

    message_nonce TEXT,

    encrypted_key TEXT,

    encryption_algorithm VARCHAR(64),

    -- ========================================================
    -- Message Generator
    -- ========================================================

    generator_type VARCHAR(20)
        NOT NULL
        DEFAULT 'user',

    generator_id UUID,

    generator_name VARCHAR(64),

    -- ========================================================
    -- Editing
    -- ========================================================

    edited BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    edit_count INTEGER
        NOT NULL
        DEFAULT 0,

    edited_at TIMESTAMPTZ,

    last_editor_id UUID,

    -- ========================================================
    -- Message Lifecycle
    -- ========================================================

    deleted_at TIMESTAMPTZ,

    deleted_by UUID,

    deleted_for_everyone BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    restored_at TIMESTAMPTZ,

    restored_by UUID,

    -- ========================================================
    -- Statistics
    -- ========================================================

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

    -- ========================================================
    -- Flags
    -- ========================================================

    is_system_message BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    is_silent BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    is_spoiler BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    -- ========================================================
    -- Audit
    -- ========================================================

    created_by UUID,

    updated_by UUID,

    created_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    -- ========================================================
    -- Relationships
    -- ========================================================

    CONSTRAINT fk_messages_chat
        FOREIGN KEY (chat_id)
        REFERENCES chats(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_messages_sender
        FOREIGN KEY (sender_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_messages_reply
        FOREIGN KEY (reply_to_message_id)
        REFERENCES messages(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_messages_thread
        FOREIGN KEY (thread_root_message_id)
        REFERENCES messages(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_messages_forward_message
        FOREIGN KEY (forwarded_from_message_id)
        REFERENCES messages(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_messages_forward_chat
        FOREIGN KEY (forwarded_from_chat_id)
        REFERENCES chats(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_messages_forward_user
        FOREIGN KEY (forwarded_from_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_messages_pinned_by
        FOREIGN KEY (pinned_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_messages_last_editor
        FOREIGN KEY (last_editor_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_messages_deleted_by
        FOREIGN KEY (deleted_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_messages_restored_by
        FOREIGN KEY (restored_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_messages_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_messages_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    -- ========================================================
    -- Validation Constraints
    -- ========================================================

    CONSTRAINT chk_messages_public_id
        CHECK (public_id LIKE 'msg_%'),

    CONSTRAINT chk_messages_type
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
        ),
            CONSTRAINT chk_messages_delivery_status
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
        ),

    CONSTRAINT chk_messages_generator_type
        CHECK (
            generator_type IN (
                'user',
                'bot',
                'ai',
                'system',
                'automation'
            )
        ),

    CONSTRAINT chk_messages_encryption_version
        CHECK (
            encryption_version IS NULL
            OR encryption_version >= 1
        ),

    CONSTRAINT chk_messages_reaction_count
        CHECK (reaction_count >= 0),

    CONSTRAINT chk_messages_reply_count
        CHECK (reply_count >= 0),

    CONSTRAINT chk_messages_forward_count
        CHECK (forward_count >= 0),

    CONSTRAINT chk_messages_view_count
        CHECK (view_count >= 0),

    CONSTRAINT chk_messages_edit_count
        CHECK (edit_count >= 0),

    CONSTRAINT chk_messages_schedule_time
        CHECK (
            scheduled_at IS NULL
            OR scheduled_at >= created_at
        ),

    CONSTRAINT chk_messages_expiry_time
        CHECK (
            expires_at IS NULL
            OR expires_at >= created_at
        ),

    CONSTRAINT chk_messages_edit_time
        CHECK (
            edited_at IS NULL
            OR edited_at >= created_at
        ),

    CONSTRAINT chk_messages_delete_time
        CHECK (
            deleted_at IS NULL
            OR deleted_at >= created_at
        ),

    CONSTRAINT chk_messages_restore_time
        CHECK (
            restored_at IS NULL
            OR deleted_at IS NOT NULL
        ),

    CONSTRAINT chk_messages_content
        CHECK (
            content IS NOT NULL
            OR metadata <> '{}'::jsonb
        ),

    CONSTRAINT chk_messages_forward_reference
        CHECK (
            forwarded_from_message_id IS NULL
            OR forwarded_from_chat_id IS NOT NULL
        ),

    CONSTRAINT chk_messages_thread_reference
        CHECK (
            thread_root_message_id IS NULL
            OR thread_root_message_id <> id
        )

);

-- ============================================================
-- Indexes
-- ============================================================

--------------------------------------------------------------
-- Primary Lookup
--------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_messages_public_id
ON messages(public_id);

--------------------------------------------------------------
-- Chat Timeline
--------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_messages_chat
ON messages(chat_id);

CREATE INDEX IF NOT EXISTS idx_messages_chat_created
ON messages(chat_id, created_at DESC);

--------------------------------------------------------------
-- Sender History
--------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_messages_sender
ON messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_messages_sender_created
ON messages(sender_id, created_at DESC);

--------------------------------------------------------------
-- Message Classification
--------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_messages_type
ON messages(message_type);

CREATE INDEX IF NOT EXISTS idx_messages_delivery
ON messages(delivery_status);

CREATE INDEX IF NOT EXISTS idx_messages_generator
ON messages(generator_type);

--------------------------------------------------------------
-- Reply & Threading
--------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_messages_reply
ON messages(reply_to_message_id);

CREATE INDEX IF NOT EXISTS idx_messages_thread
ON messages(thread_root_message_id);

--------------------------------------------------------------
-- Forwarding
--------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_messages_forward_message
ON messages(forwarded_from_message_id);

CREATE INDEX IF NOT EXISTS idx_messages_forward_chat
ON messages(forwarded_from_chat_id);

CREATE INDEX IF NOT EXISTS idx_messages_forward_user
ON messages(forwarded_from_user_id);

--------------------------------------------------------------
-- Scheduling
--------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_messages_schedule
ON messages(scheduled_at)
WHERE scheduled_at IS NOT NULL;

--------------------------------------------------------------
-- Expiring Messages
--------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_messages_expiry
ON messages(expires_at)
WHERE expires_at IS NOT NULL;

--------------------------------------------------------------
-- Edited Messages
--------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_messages_edited
ON messages(edited_at)
WHERE edited_at IS NOT NULL;

--------------------------------------------------------------
-- Deleted Messages
--------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_messages_deleted
ON messages(deleted_at)
WHERE deleted_at IS NOT NULL;
--------------------------------------------------------------
-- Pinned Messages
--------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_messages_pinned
ON messages(chat_id)
WHERE pinned = TRUE;

--------------------------------------------------------------
-- Encryption
--------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_messages_encrypted
ON messages(encrypted);

--------------------------------------------------------------
-- Audit
--------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_messages_created
ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_messages_updated
ON messages(updated_at);

--------------------------------------------------------------
-- Statistics
--------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_messages_reaction_count
ON messages(reaction_count);

CREATE INDEX IF NOT EXISTS idx_messages_reply_count
ON messages(reply_count);

CREATE INDEX IF NOT EXISTS idx_messages_forward_count
ON messages(forward_count);

CREATE INDEX IF NOT EXISTS idx_messages_view_count
ON messages(view_count);

--------------------------------------------------------------
-- Composite Performance Indexes
--------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_messages_chat_status
ON messages(chat_id, delivery_status);

CREATE INDEX IF NOT EXISTS idx_messages_chat_type
ON messages(chat_id, message_type);

CREATE INDEX IF NOT EXISTS idx_messages_chat_sender
ON messages(chat_id, sender_id);

CREATE INDEX IF NOT EXISTS idx_messages_chat_created_sender
ON messages(chat_id, created_at DESC, sender_id);

--------------------------------------------------------------
-- JSONB Metadata
--------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_messages_metadata
ON messages
USING GIN (metadata);

--------------------------------------------------------------
-- Full Text Search
--------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_messages_content_search
ON messages
USING GIN (
    to_tsvector(
        'simple',
        COALESCE(content, '')
    )
);

-- ============================================================
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
-- This table intentionally stores only message-level
-- information.
--
-- Future features supported:
--
--     ✓ AI Messages
--     ✓ Bot Messages
--     ✓ Scheduled Messages
--     ✓ Self-Destruct Messages
--     ✓ Reply Threads
--     ✓ Forwarded Messages
--     ✓ End-to-End Encryption
--     ✓ Media Attachments
--     ✓ Message Editing
--     ✓ Soft Delete
--     ✓ Full-Text Search
--     ✓ Translation
--     ✓ OCR
--     ✓ Speech-to-Text
--     ✓ AI Summaries
--     ✓ Semantic Search
--
-- Relationships
--
--     chats
--         Parent conversation.
--
--     users
--         Message sender and audit references.
--
--     attachments
--         Stores uploaded files.
--
--     reactions
--         Stores emoji reactions.
--
-- Design Goals
--
--     • Fast chat timeline queries
--     • Efficient sender history
--     • Optimized reply/thread lookups
--     • Scalable forwarding support
--     • Encryption-ready
--     • AI-ready
--     • Horizontally scalable
--
-- Built for Everyone.
-- Controlled by No One.
-- ============================================================
-- End of Migration: 006_create_messages.sql
-- ============================================================