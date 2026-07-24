-- ============================================================
-- ShadowDock Database Migration
-- Migration: 004_create_chats.sql
-- Description: Create chats table
--
-- Purpose
--   Stores every conversation inside ShadowDock.
--
-- Supported Chat Types
--   • Private Chat
--   • Group
--   • Community
--   • Channel
--   • Saved Messages
--   • Bot Conversation
--
-- Design Principles
--   • UUID primary keys
--   • Public IDs
--   • Soft deletion
--   • Future-proof schema
--   • Encryption-ready
-- ============================================================

CREATE TABLE IF NOT EXISTS chats (

    -- ========================================================
    -- Internal Identity
    -- ========================================================

    id UUID
        PRIMARY KEY
        DEFAULT gen_random_uuid(),

    -- ========================================================
    -- Public Identifier
    -- Example:
    --      chat_A82KDJ29QP
    -- ========================================================

    public_id VARCHAR(32)
        NOT NULL
        UNIQUE,

    -- ========================================================
    -- Chat Type
    -- ========================================================

    chat_type VARCHAR(20)
        NOT NULL,

    -- ========================================================
    -- Chat Profile
    -- ========================================================

    title VARCHAR(120),

    description TEXT,

    photo TEXT,

    banner TEXT,

    -- ========================================================
    -- Ownership
    -- ========================================================

    owner_id UUID,

    -- ========================================================
    -- Visibility
    -- ========================================================

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

    -- ========================================================
    -- Join Policy
    -- ========================================================

    join_policy VARCHAR(20)
        NOT NULL
        DEFAULT 'invite_only',

    invite_code VARCHAR(64),

    invite_link TEXT,

    -- ========================================================
    -- Messaging
    -- ========================================================

    slow_mode_seconds INTEGER
        NOT NULL
        DEFAULT 0,

    message_retention_days INTEGER,

    -- ========================================================
    -- Encryption
    -- ========================================================

    encryption_enabled BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    encryption_version SMALLINT,

    -- ========================================================
    -- AI
    -- ========================================================

    ai_enabled BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    -- ========================================================
    -- Statistics
    -- ========================================================

    member_count BIGINT
        NOT NULL
        DEFAULT 0,

    message_count BIGINT
        NOT NULL
        DEFAULT 0,

    media_count BIGINT
        NOT NULL
        DEFAULT 0,

    -- ========================================================
    -- Future Extension
    -- ========================================================

    metadata JSONB
        NOT NULL
        DEFAULT '{}'::jsonb,

    -- ========================================================
    -- Audit
    -- ========================================================

    created_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    deleted_at TIMESTAMPTZ,

    deleted_by UUID,

    archived_at TIMESTAMPTZ,

    -- ========================================================
    -- Foreign Keys
    -- ========================================================

    CONSTRAINT fk_chats_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_chats_deleted_by
        FOREIGN KEY (deleted_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    -- ========================================================
    -- Check Constraints
    -- ========================================================

    CONSTRAINT chk_chat_type
    CHECK (
        chat_type IN (
            'private',
            'group',
            'community',
            'channel',
            'saved',
            'bot'
        )
    ),

    CONSTRAINT chk_chat_visibility
    CHECK (
        visibility IN (
            'private',
            'public',
            'unlisted'
        )
    ),

    CONSTRAINT chk_join_policy
    CHECK (
        join_policy IN (
            'invite_only',
            'request',
            'public'
        )
    ),

    CONSTRAINT chk_slow_mode
    CHECK (
        slow_mode_seconds >= 0
    ),

    CONSTRAINT chk_member_count
    CHECK (
        member_count >= 0
    ),

    CONSTRAINT chk_message_count
    CHECK (
        message_count >= 0
    ),

    CONSTRAINT chk_media_count
    CHECK (
        media_count >= 0
    ),

    CONSTRAINT chk_retention
    CHECK (
        message_retention_days IS NULL
        OR message_retention_days > 0
    )

);
-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_chats_public_id
ON chats (public_id);

CREATE INDEX IF NOT EXISTS idx_chats_owner
ON chats (owner_id);

CREATE INDEX IF NOT EXISTS idx_chats_type
ON chats (chat_type);

CREATE INDEX IF NOT EXISTS idx_chats_type_created
ON chats (chat_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chats_visibility
ON chats (visibility);

CREATE INDEX IF NOT EXISTS idx_chats_join_policy
ON chats (join_policy);

CREATE INDEX IF NOT EXISTS idx_chats_verified
ON chats (verified);

CREATE INDEX IF NOT EXISTS idx_chats_official
ON chats (official);

CREATE INDEX IF NOT EXISTS idx_chats_discoverable
ON chats (discoverable);

CREATE INDEX IF NOT EXISTS idx_chats_created
ON chats (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chats_updated
ON chats (updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_chats_deleted
ON chats (deleted_at);

CREATE INDEX IF NOT EXISTS idx_chats_archived
ON chats (archived_at);

CREATE INDEX IF NOT EXISTS idx_chats_member_count
ON chats (member_count DESC);

-- ============================================================
-- JSONB Index
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_chats_metadata
ON chats
USING GIN (metadata);

-- ============================================================
-- Table Comments
-- ============================================================

COMMENT ON TABLE chats IS
'Stores every conversation inside ShadowDock.';

COMMENT ON COLUMN chats.id IS
'Internal UUID primary key. Never exposed to clients.';

COMMENT ON COLUMN chats.public_id IS
'Public chat identifier exposed through the API.';

COMMENT ON COLUMN chats.chat_type IS
'Conversation type: private, group, community, channel, saved, bot.';

COMMENT ON COLUMN chats.owner_id IS
'Owner of the chat when applicable (groups, channels, communities).';

COMMENT ON COLUMN chats.visibility IS
'Visibility level: private, public, unlisted.';

COMMENT ON COLUMN chats.join_policy IS
'How users are allowed to join this chat.';

COMMENT ON COLUMN chats.metadata IS
'Reserved JSON field for future extensibility.';

COMMENT ON COLUMN chats.member_count IS
'Cached member count for fast lookups.';

COMMENT ON COLUMN chats.message_count IS
'Cached message count.';

COMMENT ON COLUMN chats.media_count IS
'Cached attachment/media count.';

COMMENT ON COLUMN chats.created_at IS
'Timestamp when the chat was created.';

COMMENT ON COLUMN chats.updated_at IS
'Timestamp automatically updated on modifications.';

COMMENT ON COLUMN chats.deleted_at IS
'Soft deletion timestamp.';

COMMENT ON COLUMN chats.archived_at IS
'Archive timestamp.';

-- ============================================================
-- Notes
--
-- Internal ID
--      UUID
--
-- Public ID
--      chat_xxxxxxxxx
--
-- Supported Chat Types
--
--      • Private Conversation
--      • Group
--      • Community
--      • Channel
--      • Saved Messages
--      • Bot Conversation
--
-- Relationships
--
--      chat_members
--          Stores membership information.
--
--      messages
--          Stores all chat messages.
--
--      attachments
--          Stores uploaded files and media.
--
-- Design Goals
--
--      • Stable UUID primary keys
--      • Public IDs for external APIs
--      • Soft deletion support
--      • Encryption-ready
--      • AI-ready
--      • Horizontally scalable
--
-- ============================================================
-- End of Migration: 004_create_chats.sql
-- ============================================================