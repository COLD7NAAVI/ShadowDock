-- ==========================================================
-- ShadowDock Database Migration
-- Migration: 009_create_notifications.sql
-- Description: Create notifications table
-- ==========================================================

CREATE TABLE IF NOT EXISTS notifications (

    ----------------------------------------------------------
    -- Internal Identifier
    ----------------------------------------------------------

    id UUID PRIMARY KEY
        DEFAULT gen_random_uuid(),

    ----------------------------------------------------------
    -- Public Identifier
    -- Example:
    -- ntf_9XKD82PLQ1
    ----------------------------------------------------------

    public_id VARCHAR(20)
        NOT NULL
        UNIQUE,

    ----------------------------------------------------------
    -- Notification Recipient
    ----------------------------------------------------------

    user_id UUID
        NOT NULL,

    ----------------------------------------------------------
    -- Optional Actor
    -- User who triggered the notification
    ----------------------------------------------------------

    actor_user_id UUID,

    ----------------------------------------------------------
    -- Related Objects
    ----------------------------------------------------------

    chat_id UUID,

    message_id UUID,

    attachment_id UUID,

    reaction_id UUID,

    ----------------------------------------------------------
    -- Notification Identity
    ----------------------------------------------------------

    notification_type VARCHAR(30)
        NOT NULL,

    category VARCHAR(30)
        NOT NULL
        DEFAULT 'social',

    priority VARCHAR(20)
        NOT NULL
        DEFAULT 'normal',

    ----------------------------------------------------------
    -- Display Content
    ----------------------------------------------------------

    title VARCHAR(255)
        NOT NULL,

    body TEXT
        NOT NULL,

    image_url TEXT,

    icon TEXT,

    accent_color VARCHAR(20),

    ----------------------------------------------------------
    -- Deep Link
    -- Opens correct screen in app
    ----------------------------------------------------------

    action_url TEXT,

    action_label VARCHAR(60),

    ----------------------------------------------------------
    -- Rich Metadata
    ----------------------------------------------------------

    metadata JSONB
        NOT NULL
        DEFAULT '{}'::jsonb,

    ----------------------------------------------------------
    -- Notification Source
    ----------------------------------------------------------

    source_type VARCHAR(20)
        NOT NULL
        DEFAULT 'user',

    ----------------------------------------------------------
    -- Generator
    ----------------------------------------------------------

    generator_type VARCHAR(20)
        NOT NULL
        DEFAULT 'user',

    ----------------------------------------------------------
    -- Delivery Channels
    ----------------------------------------------------------

    deliver_in_app BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    deliver_push BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    deliver_email BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    deliver_sms BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    deliver_desktop BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    deliver_web BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    ----------------------------------------------------------
    -- Notification Preferences Snapshot
    ----------------------------------------------------------

    silent BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    vibration BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    play_sound BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    badge_increment BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    collapse_key VARCHAR(100),

    notification_group VARCHAR(100),

        ----------------------------------------------------------
    -- Delivery Lifecycle
    ----------------------------------------------------------

    delivery_status VARCHAR(20)
        NOT NULL
        DEFAULT 'queued',

    delivery_attempts INTEGER
        NOT NULL
        DEFAULT 0,

    max_delivery_attempts INTEGER
        NOT NULL
        DEFAULT 5,

    last_delivery_attempt TIMESTAMPTZ,

    delivered_at TIMESTAMPTZ,

    failed_at TIMESTAMPTZ,

    failure_reason TEXT,

    ----------------------------------------------------------
    -- Read State
    ----------------------------------------------------------

    seen BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    seen_at TIMESTAMPTZ,

    read BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    read_at TIMESTAMPTZ,

    dismissed BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    dismissed_at TIMESTAMPTZ,

    archived BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    archived_at TIMESTAMPTZ,

    ----------------------------------------------------------
    -- Scheduling
    ----------------------------------------------------------

    scheduled_for TIMESTAMPTZ,

    expires_at TIMESTAMPTZ,

    auto_delete_at TIMESTAMPTZ,

    ----------------------------------------------------------
    -- Multi-device Synchronization
    ----------------------------------------------------------

    sync_required BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    sync_completed BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    sync_completed_at TIMESTAMPTZ,

    device_scope VARCHAR(20)
        NOT NULL
        DEFAULT 'all',

    ----------------------------------------------------------
    -- Notification Actions
    ----------------------------------------------------------

    primary_action VARCHAR(100),

    secondary_action VARCHAR(100),

    action_payload JSONB
        NOT NULL
        DEFAULT '{}'::jsonb,

    ----------------------------------------------------------
    -- Analytics
    ----------------------------------------------------------

    opened_count INTEGER
        NOT NULL
        DEFAULT 0,

    clicked_count INTEGER
        NOT NULL
        DEFAULT 0,

    last_opened_at TIMESTAMPTZ,

    ----------------------------------------------------------
    -- Audit Information
    ----------------------------------------------------------

    created_by UUID,

    updated_by UUID,

    deleted_by UUID,

    ----------------------------------------------------------
    -- Soft Delete
    ----------------------------------------------------------

    deleted_at TIMESTAMPTZ,

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

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (actor_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    FOREIGN KEY (chat_id)
        REFERENCES chats(id)
        ON DELETE CASCADE,

    FOREIGN KEY (message_id)
        REFERENCES messages(id)
        ON DELETE CASCADE,

    FOREIGN KEY (attachment_id)
        REFERENCES attachments(id)
        ON DELETE SET NULL,

    FOREIGN KEY (reaction_id)
        REFERENCES reactions(id)
        ON DELETE SET NULL,

    FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    FOREIGN KEY (deleted_by)
        REFERENCES users(id)
        ON DELETE SET NULL

);
-- ==========================================================
-- Validation
-- ==========================================================

------------------------------------------------------------
-- Notification Type
------------------------------------------------------------

ALTER TABLE notifications
ADD CONSTRAINT chk_notification_type
CHECK (
    notification_type IN (

        -- Messaging
        'message',
        'reply',
        'mention',
        'reaction',

        -- Chats
        'group_invite',
        'group_join',
        'group_leave',
        'group_promote',
        'group_demote',

        -- Communities / Channels
        'community_invite',
        'community_post',
        'channel_post',
        'announcement',

        -- Calls
        'voice_call',
        'video_call',
        'missed_call',

        -- Friend / Social
        'friend_request',
        'friend_accept',

        -- Security
        'login',
        'new_device',
        'security_alert',

        -- AI / Bots
        'bot',
        'ai',

        -- System
        'system',
        'update',
        'maintenance',

        -- Reminder
        'scheduled',
        'reminder'
    )
);

------------------------------------------------------------
-- Category
------------------------------------------------------------

ALTER TABLE notifications
ADD CONSTRAINT chk_notification_category
CHECK (
    category IN (
        'social',
        'message',
        'group',
        'channel',
        'community',
        'call',
        'security',
        'system',
        'bot',
        'ai',
        'reminder'
    )
);

------------------------------------------------------------
-- Priority
------------------------------------------------------------

ALTER TABLE notifications
ADD CONSTRAINT chk_notification_priority
CHECK (
    priority IN (
        'low',
        'normal',
        'high',
        'critical'
    )
);

------------------------------------------------------------
-- Delivery Status
------------------------------------------------------------

ALTER TABLE notifications
ADD CONSTRAINT chk_notification_delivery
CHECK (
    delivery_status IN (
        'queued',
        'processing',
        'sent',
        'delivered',
        'failed',
        'cancelled',
        'expired'
    )
);

------------------------------------------------------------
-- Source Type
------------------------------------------------------------

ALTER TABLE notifications
ADD CONSTRAINT chk_notification_source
CHECK (
    source_type IN (
        'user',
        'system',
        'bot',
        'ai',
        'admin',
        'automation'
    )
);

------------------------------------------------------------
-- Generator Type
------------------------------------------------------------

ALTER TABLE notifications
ADD CONSTRAINT chk_notification_generator
CHECK (
    generator_type IN (
        'user',
        'bot',
        'ai',
        'system',
        'automation'
    )
);

------------------------------------------------------------
-- Device Scope
------------------------------------------------------------

ALTER TABLE notifications
ADD CONSTRAINT chk_notification_device_scope
CHECK (
    device_scope IN (
        'all',
        'current',
        'mobile',
        'desktop',
        'web'
    )
);

------------------------------------------------------------
-- Delivery Attempts
------------------------------------------------------------

ALTER TABLE notifications
ADD CONSTRAINT chk_notification_attempts
CHECK (
    delivery_attempts >= 0
    AND
    max_delivery_attempts > 0
    AND
    delivery_attempts <= max_delivery_attempts
);

------------------------------------------------------------
-- Analytics
------------------------------------------------------------

ALTER TABLE notifications
ADD CONSTRAINT chk_notification_analytics
CHECK (

    opened_count >= 0

    AND

    clicked_count >= 0

);

------------------------------------------------------------
-- JSON Validation
------------------------------------------------------------

ALTER TABLE notifications
ADD CONSTRAINT chk_notification_metadata
CHECK (
    jsonb_typeof(metadata) = 'object'
);

ALTER TABLE notifications
ADD CONSTRAINT chk_notification_action_payload
CHECK (
    jsonb_typeof(action_payload) = 'object'
);

------------------------------------------------------------
-- Read State Consistency
------------------------------------------------------------

ALTER TABLE notifications
ADD CONSTRAINT chk_notification_read_state
CHECK (

    (
        read = FALSE
        AND read_at IS NULL
    )

    OR

    (
        read = TRUE
        AND read_at IS NOT NULL
    )

);

------------------------------------------------------------
-- Seen State Consistency
------------------------------------------------------------

ALTER TABLE notifications
ADD CONSTRAINT chk_notification_seen_state
CHECK (

    (
        seen = FALSE
        AND seen_at IS NULL
    )

    OR

    (
        seen = TRUE
        AND seen_at IS NOT NULL
    )

);

------------------------------------------------------------
-- Soft Delete Consistency
------------------------------------------------------------

ALTER TABLE notifications
ADD CONSTRAINT chk_notification_deleted
CHECK (

    (
        deleted_at IS NULL
        AND deleted_by IS NULL
    )

    OR

    (
        deleted_at IS NOT NULL
    )

);

------------------------------------------------------------
-- Expiration
------------------------------------------------------------

ALTER TABLE notifications
ADD CONSTRAINT chk_notification_expiry
CHECK (

    expires_at IS NULL

    OR

    expires_at > created_at

);

------------------------------------------------------------
-- Scheduling
------------------------------------------------------------

ALTER TABLE notifications
ADD CONSTRAINT chk_notification_schedule
CHECK (

    scheduled_for IS NULL

    OR

    expires_at IS NULL

    OR

    scheduled_for < expires_at

);
-- ==========================================================
-- Indexes
-- ==========================================================

------------------------------------------------------------
-- Public Lookup
------------------------------------------------------------

CREATE UNIQUE INDEX idx_notifications_public
ON notifications(public_id);

------------------------------------------------------------
-- User Queries
------------------------------------------------------------

CREATE INDEX idx_notifications_user
ON notifications(user_id);

CREATE INDEX idx_notifications_user_created
ON notifications(user_id, created_at DESC);

CREATE INDEX idx_notifications_user_read
ON notifications(user_id, read);

CREATE INDEX idx_notifications_user_seen
ON notifications(user_id, seen);

CREATE INDEX idx_notifications_user_archived
ON notifications(user_id, archived);

------------------------------------------------------------
-- Notification Type
------------------------------------------------------------

CREATE INDEX idx_notifications_type
ON notifications(notification_type);

CREATE INDEX idx_notifications_category
ON notifications(category);

CREATE INDEX idx_notifications_priority
ON notifications(priority);

------------------------------------------------------------
-- Delivery
------------------------------------------------------------

CREATE INDEX idx_notifications_delivery
ON notifications(delivery_status);

CREATE INDEX idx_notifications_delivery_attempts
ON notifications(delivery_attempts);

------------------------------------------------------------
-- Scheduling
------------------------------------------------------------

CREATE INDEX idx_notifications_schedule
ON notifications(scheduled_for);

CREATE INDEX idx_notifications_expiry
ON notifications(expires_at);

CREATE INDEX idx_notifications_auto_delete
ON notifications(auto_delete_at);

------------------------------------------------------------
-- Related Objects
------------------------------------------------------------

CREATE INDEX idx_notifications_chat
ON notifications(chat_id);

CREATE INDEX idx_notifications_message
ON notifications(message_id);

CREATE INDEX idx_notifications_attachment
ON notifications(attachment_id);

CREATE INDEX idx_notifications_reaction
ON notifications(reaction_id);

CREATE INDEX idx_notifications_actor
ON notifications(actor_user_id);

------------------------------------------------------------
-- Source
------------------------------------------------------------

CREATE INDEX idx_notifications_source
ON notifications(source_type);

CREATE INDEX idx_notifications_generator
ON notifications(generator_type);

------------------------------------------------------------
-- Read State
------------------------------------------------------------

CREATE INDEX idx_notifications_read
ON notifications(read);

CREATE INDEX idx_notifications_seen
ON notifications(seen);

CREATE INDEX idx_notifications_dismissed
ON notifications(dismissed);

CREATE INDEX idx_notifications_archived
ON notifications(archived);

------------------------------------------------------------
-- Metadata
------------------------------------------------------------

CREATE INDEX idx_notifications_metadata
ON notifications
USING GIN(metadata);

CREATE INDEX idx_notifications_action_payload
ON notifications
USING GIN(action_payload);

------------------------------------------------------------
-- Composite Indexes
------------------------------------------------------------

CREATE INDEX idx_notifications_user_delivery
ON notifications(
    user_id,
    delivery_status
);

CREATE INDEX idx_notifications_user_priority
ON notifications(
    user_id,
    priority
);

CREATE INDEX idx_notifications_user_created_desc
ON notifications(
    user_id,
    created_at DESC
);

CREATE INDEX idx_notifications_user_unread
ON notifications(
    user_id,
    read,
    created_at DESC
);

CREATE INDEX idx_notifications_user_unseen
ON notifications(
    user_id,
    seen,
    created_at DESC
);

CREATE INDEX idx_notifications_schedule_queue
ON notifications(
    delivery_status,
    scheduled_for
);

------------------------------------------------------------
-- Partial Indexes
------------------------------------------------------------

CREATE INDEX idx_notifications_pending
ON notifications(
    scheduled_for
)
WHERE delivery_status = 'queued';

CREATE INDEX idx_notifications_failed
ON notifications(
    failed_at
)
WHERE delivery_status = 'failed';

CREATE INDEX idx_notifications_unread
ON notifications(
    user_id,
    created_at DESC
)
WHERE read = FALSE;

CREATE INDEX idx_notifications_unseen
ON notifications(
    user_id,
    created_at DESC
)
WHERE seen = FALSE;

CREATE INDEX idx_notifications_not_deleted
ON notifications(
    user_id,
    created_at DESC
)
WHERE deleted_at IS NULL;

CREATE INDEX idx_notifications_not_archived
ON notifications(
    user_id,
    created_at DESC
)
WHERE archived = FALSE;

------------------------------------------------------------
-- Future Ready
------------------------------------------------------------
--
-- ✓ Message Notifications
-- ✓ Reply Notifications
-- ✓ Mention Notifications
-- ✓ Reaction Notifications
-- ✓ Group Invites
-- ✓ Community Invites
-- ✓ Channel Posts
-- ✓ Announcements
-- ✓ Voice Calls
-- ✓ Video Calls
-- ✓ Missed Calls
-- ✓ Friend Requests
-- ✓ Login Alerts
-- ✓ Device Login Alerts
-- ✓ Security Alerts
-- ✓ AI Notifications
-- ✓ Bot Notifications
-- ✓ System Notifications
-- ✓ Reminder Notifications
-- ✓ Scheduled Notifications
-- ✓ Silent Notifications
-- ✓ Push Notifications
-- ✓ Desktop Notifications
-- ✓ Web Notifications
-- ✓ Email Notifications
-- ✓ SMS Notifications (Optional)
-- ✓ Multi-device Synchronization
-- ✓ Notification Actions
-- ✓ Rich Notifications
-- ✓ Deep Linking
-- ✓ Notification Analytics
-- ✓ Offline Queue
-- ✓ Retry Queue
-- ✓ Notification Grouping
-- ✓ Badge Counter
-- ✓ Priority Queue
-- ✓ E2EE Compatible Metadata
-- ✓ Billions of Notifications Ready
--
-- ==========================================================
-- ShadowDock Initial Database Architecture Complete
-- Version : 1.0
--
-- Built for Everyone.
-- Controlled by No One.
-- ==========================================================