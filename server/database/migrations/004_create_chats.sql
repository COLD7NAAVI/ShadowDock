-- ============================================================
-- ShadowDock Database Migration
-- Migration: 004_create_chats.sql
-- Description: Create chats table
--
-- Purpose:
--   Represents every conversation inside ShadowDock.
--
-- Supported Types:
--   • Private Chat
--   • Group
--   • Community
--   • Channel
--   • Saved Messages
--   • Bot Conversation
--
-- Design Principles:
--   • Internal UUIDs only
--   • Public IDs exposed externally
--   • Soft deletion
--   • Future-proof
--   • Encryption Ready
-- ============================================================

CREATE TABLE IF NOT EXISTS chats (

    -- ============================================================
    -- Internal Identity
    -- ============================================================

    id UUID PRIMARY KEY
        DEFAULT gen_random_uuid(),

    -- ============================================================
    -- Public Identifier
    --
    -- Example:
    -- chat_A82KDJ29QP
    -- ============================================================

    public_id VARCHAR(32)
        NOT NULL
        UNIQUE,

    -- ============================================================
    -- Chat Type
    -- ============================================================

    chat_type VARCHAR(20)
        NOT NULL,

    -- ============================================================
    -- Chat Profile
    -- ============================================================

    title VARCHAR(120),

    description TEXT,

    photo TEXT,

    banner TEXT,

    -- ============================================================
    -- Ownership
    -- ============================================================

    owner_id UUID,

    -- ============================================================
    -- Visibility
    -- ============================================================

    visibility VARCHAR(20)
        NOT NULL
        DEFAULT 'private',

    discoverable BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    verified BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    official BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    -- ============================================================
    -- Join Policy
    -- ============================================================

    join_policy VARCHAR(20)
        NOT NULL
        DEFAULT 'invite_only',

    invite_code VARCHAR(64),

    invite_link TEXT,

    -- ============================================================
    -- Messaging
    -- ============================================================

    slow_mode_seconds INTEGER
        NOT NULL
        DEFAULT 0,

    message_retention_days INTEGER,

    -- ============================================================
    -- Encryption
    -- ============================================================

    encryption_enabled BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    encryption_version SMALLINT,

    -- ============================================================
    -- AI
    -- ============================================================

    ai_enabled BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    -- ============================================================
    -- Statistics
    -- ============================================================

    member_count BIGINT
        NOT NULL
        DEFAULT 0,

    message_count BIGINT
        NOT NULL
        DEFAULT 0,

    media_count BIGINT
        NOT NULL
        DEFAULT 0,

    -- ============================================================
    -- Future Extension
    -- ============================================================

    metadata JSONB
        NOT NULL
        DEFAULT '{}'::jsonb,

    -- ============================================================
    -- Audit
    -- ============================================================

    created_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    deleted_at TIMESTAMPTZ,

    deleted_by UUID,

    archived_at TIMESTAMPTZ,

    -- ============================================================
    -- Relationships
    -- ============================================================

    FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    FOREIGN KEY (deleted_by)
        REFERENCES users(id)
        ON DELETE SET NULL

)
-- ============================================================
-- Constraints
-- ============================================================

ALTER TABLE chats
ADD CONSTRAINT chk_chat_type
CHECK (
    chat_type IN (
        'private',
        'group',
        'community',
        'channel',
        'saved',
        'bot'
    )
);

ALTER TABLE chats
ADD CONSTRAINT chk_chat_visibility
CHECK (
    visibility IN (
        'private',
        'public',
        'unlisted'
    )
);

ALTER TABLE chats
ADD CONSTRAINT chk_join_policy
CHECK (
    join_policy IN (
        'invite_only',
        'request',
        'public'
    )
);

ALTER TABLE chats
ADD CONSTRAINT chk_slow_mode
CHECK (
    slow_mode_seconds >= 0
);

ALTER TABLE chats
ADD CONSTRAINT chk_member_count
CHECK (
    member_count >= 0
);

ALTER TABLE chats
ADD CONSTRAINT chk_message_count
CHECK (
    message_count >= 0
);

ALTER TABLE chats
ADD CONSTRAINT chk_media_count
CHECK (
    media_count >= 0
);

ALTER TABLE chats
ADD CONSTRAINT chk_retention
CHECK (
    message_retention_days IS NULL
    OR message_retention_days > 0
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_chats_public_id
ON chats(public_id);

CREATE INDEX idx_chats_owner
ON chats(owner_id);

CREATE INDEX idx_chats_type
ON chats(chat_type);

CREATE INDEX idx_chats_type_created
ON chats(chat_type, created_at DESC);

CREATE INDEX idx_chats_visibility
ON chats(visibility);

CREATE INDEX idx_chats_join_policy
ON chats(join_policy);

CREATE INDEX idx_chats_verified
ON chats(verified);

CREATE INDEX idx_chats_official
ON chats(official);

CREATE INDEX idx_chats_discoverable
ON chats(discoverable);

CREATE INDEX idx_chats_created
ON chats(created_at);

CREATE INDEX idx_chats_updated
ON chats(updated_at);

CREATE INDEX idx_chats_deleted
ON chats(deleted_at);

CREATE INDEX idx_chats_archived
ON chats(archived_at);

CREATE INDEX idx_chats_member_count
ON chats(member_count);

-- ============================================================
-- JSONB Index
-- ============================================================

CREATE INDEX idx_chats_metadata
ON chats
USING GIN (metadata);

-- ============================================================
-- Notes
--
-- Internal ID:
--      UUID
--
-- Public ID:
--      chat_xxxxxxxxx
--
-- One chat can represent:
--
--      • Private Conversation
--      • Group
--      • Community
--      • Channel
--      • Saved Messages
--      • Bot Conversation
--
-- Members are stored in:
--
--      chat_members
--
-- Messages are stored in:
--
--      messages
--
-- Attachments are stored in:
--
--      attachments
--
-- This table intentionally stores
-- only chat-level information.
--
-- Built for Everyone.
-- Controlled by No One.
-- ============================================================