-- ============================================
-- ShadowDock Database Migration
-- Migration: 001_create_users.sql
-- Description: Create users table
-- ============================================

CREATE TABLE IF NOT EXISTS users (

    -- ============================================================
    -- Internal Identity
    -- ============================================================

    id UUID PRIMARY KEY
        DEFAULT gen_random_uuid(),

    -- Public user identifier shown to users
    public_id VARCHAR(24)
        NOT NULL
        UNIQUE,

    -- Human-friendly numeric account identifier
    account_number BIGSERIAL
        UNIQUE,

    -- ============================================================
    -- Account Identity
    -- ============================================================

    username VARCHAR(32)
        NOT NULL
        UNIQUE,

    display_name VARCHAR(64)
        NOT NULL,

    email VARCHAR(255)
        UNIQUE,

    password_hash TEXT
        NOT NULL,

    -- ============================================================
    -- Profile
    -- ============================================================

    avatar TEXT,

    bio TEXT,

    -- ============================================================
    -- Presence
    -- ============================================================

    status VARCHAR(20)
        NOT NULL
        DEFAULT 'offline',

    last_seen TIMESTAMPTZ,

    show_online_status BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    -- ============================================================
    -- Privacy
    -- ============================================================

    profile_visibility VARCHAR(20)
        NOT NULL
        DEFAULT 'everyone',

    last_seen_visibility VARCHAR(20)
        NOT NULL
        DEFAULT 'everyone',

    read_receipts_enabled BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    -- ============================================================
    -- Verification
    -- ============================================================

    verified BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    -- ============================================================
    -- Account State
    -- ============================================================

    account_deleted BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    banned BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    banned_reason TEXT,

    banned_until TIMESTAMPTZ,

    -- ============================================================
    -- Localization
    -- ============================================================

    language_code VARCHAR(10),

    timezone VARCHAR(100),

    -- ============================================================
    -- Security
    -- ============================================================

    password_changed_at TIMESTAMPTZ,

    username_changed_at TIMESTAMPTZ,

    profile_updated_at TIMESTAMPTZ,

    -- ============================================================
    -- Metadata
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

    -- ============================================================
    -- Constraints
    -- ============================================================

    CONSTRAINT chk_users_status
        CHECK (
            status IN (
                'online',
                'offline',
                'away',
                'busy'
            )
        ),

    CONSTRAINT chk_profile_visibility
        CHECK (
            profile_visibility IN (
                'everyone',
                'contacts',
                'nobody'
            )
        ),

    CONSTRAINT chk_last_seen_visibility
        CHECK (
            last_seen_visibility IN (
                'everyone',
                'contacts',
                'nobody'
            )
        )

);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_users_public_id
ON users(public_id);

CREATE INDEX idx_users_account_number
ON users(account_number);

CREATE INDEX idx_users_username
ON users(username);

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_users_status
ON users(status);

CREATE INDEX idx_users_verified
ON users(verified);

CREATE INDEX idx_users_banned
ON users(banned);

CREATE INDEX idx_users_created
ON users(created_at);

CREATE INDEX idx_users_last_seen
ON users(last_seen);

CREATE INDEX idx_users_deleted
ON users(deleted_at);