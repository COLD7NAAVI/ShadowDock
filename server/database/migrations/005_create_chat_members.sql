-- ============================================================
-- ShadowDock Database Migration
-- Migration: 005_create_chat_members.sql
-- Description: Membership information for every chat
--
-- Purpose:
--     Connects users with chats while storing
--     membership state, preferences, audit data,
--     and future permission caching.
--
-- Notes:
--     One record = one user inside one chat.
--
-- ============================================================

CREATE TABLE IF NOT EXISTS chat_members (

    ------------------------------------------------------------
    -- Internal Identifier
    ------------------------------------------------------------

    id UUID PRIMARY KEY
        DEFAULT gen_random_uuid(),

    ------------------------------------------------------------
    -- Relationships
    ------------------------------------------------------------

    chat_id UUID
        NOT NULL,

    user_id UUID
        NOT NULL,

    ------------------------------------------------------------
    -- Membership Role
    ------------------------------------------------------------

    role VARCHAR(20)
        NOT NULL
        DEFAULT 'member',

    ------------------------------------------------------------
    -- Invitation Information
    ------------------------------------------------------------

    invited_by UUID,

    invitation_type VARCHAR(20)
        NOT NULL
        DEFAULT 'user',

    ------------------------------------------------------------
    -- Local Chat Profile
    ------------------------------------------------------------

    local_display_name VARCHAR(64),

    ------------------------------------------------------------
    -- User Preferences
    ------------------------------------------------------------

    notification_level VARCHAR(20)
        NOT NULL
        DEFAULT 'all',

    pinned BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    archived BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    muted_until TIMESTAMPTZ,

    ------------------------------------------------------------
    -- Membership State
    ------------------------------------------------------------

    joined_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    left_at TIMESTAMPTZ,

    banned_at TIMESTAMPTZ,

    last_read_message_id UUID,

    last_read_at TIMESTAMPTZ,

    unread_count INTEGER
        NOT NULL
        DEFAULT 0,

    ------------------------------------------------------------
    -- Cached Permissions
    --
    -- These are cached values.
    -- Future versions will derive these from
    -- Roles + Permissions.
    ------------------------------------------------------------

    can_send_messages BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    can_send_media BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    can_send_polls BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    can_send_voice BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    can_send_video BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    can_invite_users BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    can_pin_messages BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    can_delete_messages BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    can_manage_chat BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    can_manage_members BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    can_manage_roles BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    ------------------------------------------------------------
    -- Future Extension
    ------------------------------------------------------------

    metadata JSONB
        NOT NULL
        DEFAULT '{}'::jsonb,

    ------------------------------------------------------------
    -- Audit
    ------------------------------------------------------------

    created_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    created_by UUID,

    updated_by UUID,

    ------------------------------------------------------------
    -- Constraints
    ------------------------------------------------------------

    CONSTRAINT uq_chat_member
        UNIQUE (chat_id, user_id),

    ------------------------------------------------------------
    -- Relationships
    ------------------------------------------------------------

    FOREIGN KEY (chat_id)
        REFERENCES chats(id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (invited_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON DELETE SET NULL

)
-- ============================================================
-- Validation
-- ============================================================

ALTER TABLE chat_members
ADD CONSTRAINT chk_chat_member_role
CHECK (
    role IN (
        'owner',
        'admin',
        'moderator',
        'member',
        'subscriber',
        'bot'
    )
);

ALTER TABLE chat_members
ADD CONSTRAINT chk_notification_level
CHECK (
    notification_level IN (
        'all',
        'mentions',
        'important',
        'none'
    )
);

ALTER TABLE chat_members
ADD CONSTRAINT chk_invitation_type
CHECK (
    invitation_type IN (
        'user',
        'invite_link',
        'public',
        'bot',
        'import',
        'system'
    )
);

ALTER TABLE chat_members
ADD CONSTRAINT chk_unread_count
CHECK (
    unread_count >= 0
);

ALTER TABLE chat_members
ADD CONSTRAINT chk_permission_dependency
CHECK (
    NOT can_manage_roles
    OR can_manage_members
);

ALTER TABLE chat_members
ADD CONSTRAINT chk_banned_after_join
CHECK (
    banned_at IS NULL
    OR banned_at >= joined_at
);

ALTER TABLE chat_members
ADD CONSTRAINT chk_left_after_join
CHECK (
    left_at IS NULL
    OR left_at >= joined_at
);

ALTER TABLE chat_members
ADD CONSTRAINT chk_last_read_after_join
CHECK (
    last_read_at IS NULL
    OR last_read_at >= joined_at
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_chat_members_chat
ON chat_members(chat_id);

CREATE INDEX idx_chat_members_user
ON chat_members(user_id);

CREATE INDEX idx_chat_members_chat_user
ON chat_members(chat_id, user_id);

CREATE INDEX idx_chat_members_role
ON chat_members(role);

CREATE INDEX idx_chat_members_joined
ON chat_members(joined_at);

CREATE INDEX idx_chat_members_left
ON chat_members(left_at);

CREATE INDEX idx_chat_members_banned
ON chat_members(banned_at);

CREATE INDEX idx_chat_members_notification
ON chat_members(notification_level);

CREATE INDEX idx_chat_members_last_read
ON chat_members(last_read_message_id);

CREATE INDEX idx_chat_members_last_read_at
ON chat_members(last_read_at);

CREATE INDEX idx_chat_members_unread
ON chat_members(unread_count);

CREATE INDEX idx_chat_members_archived
ON chat_members(archived);

CREATE INDEX idx_chat_members_pinned
ON chat_members(pinned);

CREATE INDEX idx_chat_members_muted
ON chat_members(muted_until);

CREATE INDEX idx_chat_members_created
ON chat_members(created_at);

CREATE INDEX idx_chat_members_updated
ON chat_members(updated_at);

-- ============================================================
-- Partial Indexes
-- ============================================================

CREATE INDEX idx_chat_members_active
ON chat_members(chat_id)
WHERE left_at IS NULL
AND banned_at IS NULL;

CREATE INDEX idx_chat_members_admins
ON chat_members(chat_id)
WHERE role IN (
    'owner',
    'admin',
    'moderator'
);

CREATE INDEX idx_chat_members_muted_active
ON chat_members(muted_until)
WHERE muted_until IS NOT NULL;

-- ============================================================
-- JSONB Index
-- ============================================================

CREATE INDEX idx_chat_members_metadata
ON chat_members
USING GIN (metadata);

-- ============================================================
-- Notes
--
-- One row represents one user's membership in one chat.
--
-- Membership lifecycle:
--
-- Joined
--      ↓
-- Active
--      ↓
-- Muted / Archived / Pinned
--      ↓
-- Left or Banned
--
-- Permissions stored here are cached values for fast
-- authorization. Future versions may derive these from
-- dedicated roles and permissions tables while preserving
-- the same application interface.
--
-- Read state is stored per member rather than per chat,
-- allowing independent synchronization across multiple
-- devices.
--
-- Metadata JSONB stores future per-member settings such as:
--   • Translation preferences
--   • Accessibility options
--   • AI preferences
--   • Chat themes
--   • Folder state
--   • Reminder settings
--
-- Built for Everyone.
-- Controlled by No One.
-- ============================================================