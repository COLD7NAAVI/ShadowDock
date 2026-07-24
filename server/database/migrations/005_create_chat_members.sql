-- ============================================================
-- ShadowDock Database Migration
-- Migration: 005_create_chat_members.sql
-- Description: Create chat_members table
--
-- Purpose
--   Stores membership information for every user
--   participating in every chat.
--
-- One Row Represents
--   One User
--       ↓
--   Inside One Chat
--
-- Design Principles
--   • UUID primary keys
--   • Cached permissions
--   • Per-user chat preferences
--   • Read state tracking
--   • Soft membership lifecycle
--   • Future role system ready
-- ============================================================

CREATE TABLE IF NOT EXISTS chat_members (

    -- ========================================================
    -- Internal Identity
    -- ========================================================

    id UUID
        PRIMARY KEY
        DEFAULT gen_random_uuid(),

    -- ========================================================
    -- Relationships
    -- ========================================================

    chat_id UUID
        NOT NULL,

    user_id UUID
        NOT NULL,

    -- ========================================================
    -- Membership Role
    -- ========================================================

    role VARCHAR(20)
        NOT NULL
        DEFAULT 'member',

    -- ========================================================
    -- Invitation
    -- ========================================================

    invited_by UUID,

    invitation_type VARCHAR(20)
        NOT NULL
        DEFAULT 'user',

    -- ========================================================
    -- Local Chat Profile
    -- ========================================================

    local_display_name VARCHAR(64),

    -- ========================================================
    -- User Preferences
    -- ========================================================

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

    -- ========================================================
    -- Membership Lifecycle
    -- ========================================================

    joined_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    left_at TIMESTAMPTZ,

    banned_at TIMESTAMPTZ,

    -- ========================================================
    -- Read State
    -- ========================================================

    last_read_message_id UUID,

    last_read_at TIMESTAMPTZ,

    unread_count INTEGER
        NOT NULL
        DEFAULT 0,

    -- ========================================================
    -- Cached Permissions
    --
    -- Future versions will derive these from
    -- Roles + Permission tables.
    -- ========================================================

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

    created_by UUID,

    updated_by UUID,

    -- ========================================================
    -- Unique Constraints
    -- ========================================================

    CONSTRAINT uq_chat_member
        UNIQUE (chat_id, user_id),

    -- ========================================================
    -- Foreign Keys
    -- ========================================================

    CONSTRAINT fk_chat_members_chat
        FOREIGN KEY (chat_id)
        REFERENCES chats(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_chat_members_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_chat_members_invited_by
        FOREIGN KEY (invited_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_chat_members_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_chat_members_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    -- ========================================================
    -- Check Constraints
    -- ========================================================

    CONSTRAINT chk_chat_member_role
    CHECK (
        role IN (
            'owner',
            'admin',
            'moderator',
            'member',
            'subscriber',
            'bot'
        )
    ),

    CONSTRAINT chk_notification_level
    CHECK (
        notification_level IN (
            'all',
            'mentions',
            'important',
            'none'
        )
    ),

    CONSTRAINT chk_invitation_type
    CHECK (
        invitation_type IN (
            'user',
            'invite_link',
            'public',
            'bot',
            'import',
            'system'
        )
    ),

    CONSTRAINT chk_unread_count
    CHECK (
        unread_count >= 0
    ),

    CONSTRAINT chk_permission_dependency
    CHECK (
        NOT can_manage_roles
        OR can_manage_members
    ),

    CONSTRAINT chk_banned_after_join
    CHECK (
        banned_at IS NULL
        OR banned_at >= joined_at
    ),

    CONSTRAINT chk_left_after_join
    CHECK (
        left_at IS NULL
        OR left_at >= joined_at
    ),

    CONSTRAINT chk_last_read_after_join
    CHECK (
        last_read_at IS NULL
        OR last_read_at >= joined_at
    )

);
-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_chat_members_chat
ON chat_members (chat_id);

CREATE INDEX IF NOT EXISTS idx_chat_members_user
ON chat_members (user_id);

CREATE INDEX IF NOT EXISTS idx_chat_members_chat_user
ON chat_members (chat_id, user_id);

CREATE INDEX IF NOT EXISTS idx_chat_members_role
ON chat_members (role);

CREATE INDEX IF NOT EXISTS idx_chat_members_joined
ON chat_members (joined_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_members_left
ON chat_members (left_at);

CREATE INDEX IF NOT EXISTS idx_chat_members_banned
ON chat_members (banned_at);

CREATE INDEX IF NOT EXISTS idx_chat_members_notification
ON chat_members (notification_level);

CREATE INDEX IF NOT EXISTS idx_chat_members_last_read_message
ON chat_members (last_read_message_id);

CREATE INDEX IF NOT EXISTS idx_chat_members_last_read_at
ON chat_members (last_read_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_members_unread
ON chat_members (unread_count DESC);

CREATE INDEX IF NOT EXISTS idx_chat_members_archived
ON chat_members (archived);

CREATE INDEX IF NOT EXISTS idx_chat_members_pinned
ON chat_members (pinned);

CREATE INDEX IF NOT EXISTS idx_chat_members_muted
ON chat_members (muted_until);

CREATE INDEX IF NOT EXISTS idx_chat_members_created
ON chat_members (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_members_updated
ON chat_members (updated_at DESC);

-- ============================================================
-- Partial Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_chat_members_active
ON chat_members (chat_id)
WHERE left_at IS NULL
  AND banned_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_chat_members_admins
ON chat_members (chat_id)
WHERE role IN (
    'owner',
    'admin',
    'moderator'
);

CREATE INDEX IF NOT EXISTS idx_chat_members_muted_active
ON chat_members (muted_until)
WHERE muted_until IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_members_unread_active
ON chat_members (chat_id, unread_count DESC)
WHERE unread_count > 0
  AND left_at IS NULL
  AND banned_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_chat_members_active_users
ON chat_members (user_id)
WHERE left_at IS NULL
  AND banned_at IS NULL;

-- ============================================================
-- JSONB Index
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_chat_members_metadata
ON chat_members
USING GIN (metadata);
-- ============================================================
-- Database Documentation
-- ============================================================

COMMENT ON TABLE chat_members IS
'Stores membership information for every user participating in every chat.';

COMMENT ON COLUMN chat_members.id IS
'Internal UUID primary key. Never exposed to clients.';

COMMENT ON COLUMN chat_members.chat_id IS
'References the chat this membership belongs to.';

COMMENT ON COLUMN chat_members.user_id IS
'References the user who is a member of the chat.';

COMMENT ON COLUMN chat_members.role IS
'Current membership role inside the chat.';

COMMENT ON COLUMN chat_members.invited_by IS
'User who invited this member into the chat.';

COMMENT ON COLUMN chat_members.invitation_type IS
'How the member joined the chat.';

COMMENT ON COLUMN chat_members.local_display_name IS
'Optional nickname visible only inside this chat.';

COMMENT ON COLUMN chat_members.notification_level IS
'Notification preference for this specific chat.';

COMMENT ON COLUMN chat_members.pinned IS
'Whether this chat is pinned for the member.';

COMMENT ON COLUMN chat_members.archived IS
'Whether this chat is archived for the member.';

COMMENT ON COLUMN chat_members.muted_until IS
'Mute expiration timestamp. NULL means not muted.';

COMMENT ON COLUMN chat_members.joined_at IS
'Timestamp when the user joined the chat.';

COMMENT ON COLUMN chat_members.left_at IS
'Timestamp when the member voluntarily left the chat.';

COMMENT ON COLUMN chat_members.banned_at IS
'Timestamp when the member was banned from the chat.';

COMMENT ON COLUMN chat_members.last_read_message_id IS
'Most recent message acknowledged by the member.';

COMMENT ON COLUMN chat_members.last_read_at IS
'Timestamp of the latest read event.';

COMMENT ON COLUMN chat_members.unread_count IS
'Cached unread message count.';

COMMENT ON COLUMN chat_members.can_send_messages IS
'Cached permission allowing text messages.';

COMMENT ON COLUMN chat_members.can_send_media IS
'Cached permission allowing media uploads.';

COMMENT ON COLUMN chat_members.can_send_polls IS
'Cached permission allowing poll creation.';

COMMENT ON COLUMN chat_members.can_send_voice IS
'Cached permission allowing voice messages.';

COMMENT ON COLUMN chat_members.can_send_video IS
'Cached permission allowing video messages.';

COMMENT ON COLUMN chat_members.can_invite_users IS
'Cached permission allowing invitations.';

COMMENT ON COLUMN chat_members.can_pin_messages IS
'Cached permission allowing message pinning.';

COMMENT ON COLUMN chat_members.can_delete_messages IS
'Cached permission allowing message deletion.';

COMMENT ON COLUMN chat_members.can_manage_chat IS
'Cached permission allowing chat configuration changes.';

COMMENT ON COLUMN chat_members.can_manage_members IS
'Cached permission allowing member management.';

COMMENT ON COLUMN chat_members.can_manage_roles IS
'Cached permission allowing role management.';

COMMENT ON COLUMN chat_members.metadata IS
'Reserved JSON document for future per-member settings and features.';

COMMENT ON COLUMN chat_members.created_at IS
'Timestamp when this membership record was created.';

COMMENT ON COLUMN chat_members.updated_at IS
'Timestamp automatically updated whenever the membership changes.';

COMMENT ON COLUMN chat_members.created_by IS
'User responsible for creating this membership record.';

COMMENT ON COLUMN chat_members.updated_by IS
'User responsible for the most recent update.';

-- ============================================================
-- Notes
--
-- One row represents one user's membership in one chat.
--
-- Membership Lifecycle
--
--      Joined
--          ↓
--      Active
--          ↓
--      Muted / Archived / Pinned
--          ↓
--      Left
--          or
--      Banned
--
-- Cached Permissions
--
-- Permission flags are intentionally stored here to allow
-- constant-time authorization during message delivery.
--
-- A future RBAC (Role-Based Access Control) system can
-- recompute these values without changing the application API.
--
-- Read State
--
-- Read progress is tracked per member rather than per chat,
-- enabling independent synchronization across multiple devices.
--
-- Metadata JSONB
--
-- Reserved for future member-specific settings:
--
--      • Translation preferences
--      • Accessibility options
--      • AI preferences
--      • Chat themes
--      • Folder organization
--      • Reminder settings
--      • Message filters
--      • Experimental features
--
-- Design Goals
--
--      • Fast membership lookups
--      • Fast unread counts
--      • Fast permission checks
--      • Multi-device synchronization
--      • Future RBAC support
--      • Horizontal scalability
--      • Encryption-ready
--
-- ============================================================
-- End of Migration: 005_create_chat_members.sql
-- ============================================================