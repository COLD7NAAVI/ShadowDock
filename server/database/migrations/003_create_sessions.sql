-- ============================================
-- ShadowDock Database Migration
-- Migration: 003_create_sessions.sql
-- Description: User authentication sessions
-- ============================================

CREATE TABLE IF NOT EXISTS sessions (

    -- ============================================================
    -- Internal Identity
    -- ============================================================

    id UUID PRIMARY KEY
        DEFAULT gen_random_uuid(),

    -- Public Session ID
    public_id VARCHAR(24)
        NOT NULL
        UNIQUE,

    -- ============================================================
    -- Relationships
    -- ============================================================

    user_id UUID
        NOT NULL,

    device_id UUID
        NOT NULL,

    -- ============================================================
    -- Authentication
    -- ============================================================

    refresh_token_hash TEXT
        NOT NULL,

    token_version INTEGER
        NOT NULL
        DEFAULT 1,

    -- ============================================================
    -- Client Information
    -- ============================================================

    ip_address INET,

    user_agent TEXT,

    country VARCHAR(100),

    city VARCHAR(100),

    -- ============================================================
    -- Security
    -- ============================================================

    mfa_verified BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    risk_score SMALLINT
        NOT NULL
        DEFAULT 0,

    suspicious BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    -- ============================================================
    -- Session State
    -- ============================================================

    session_state VARCHAR(20)
        NOT NULL
        DEFAULT 'active',

    last_activity TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    expires_at TIMESTAMPTZ
        NOT NULL,

    revoked_at TIMESTAMPTZ,

    terminated_at TIMESTAMPTZ,

    terminated_by UUID,

    termination_reason TEXT,

    -- ============================================================
    -- Future Authentication
    -- ============================================================

    passkey_used BOOLEAN
        NOT NULL
        DEFAULT FALSE,

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
    -- Relationships
    -- ============================================================

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (device_id)
        REFERENCES devices(id)
        ON DELETE CASCADE,

    FOREIGN KEY (terminated_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    -- ============================================================
    -- Constraints
    -- ============================================================

    CONSTRAINT chk_session_state
        CHECK (
            session_state IN (
                'active',
                'expired',
                'revoked',
                'terminated'
            )
        ),

    CONSTRAINT chk_risk_score
        CHECK (
            risk_score BETWEEN 0 AND 100
        )

);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_sessions_public_id
ON sessions(public_id);

CREATE INDEX idx_sessions_user
ON sessions(user_id);

CREATE INDEX idx_sessions_device
ON sessions(device_id);

CREATE INDEX idx_sessions_state
ON sessions(session_state);

CREATE INDEX idx_sessions_last_activity
ON sessions(last_activity);

CREATE INDEX idx_sessions_expiry
ON sessions(expires_at);

CREATE INDEX idx_sessions_revoked
ON sessions(revoked_at);

CREATE INDEX idx_sessions_created
ON sessions(created_at);

CREATE INDEX idx_sessions_deleted
ON sessions(deleted_at);

CREATE INDEX idx_sessions_risk
ON sessions(risk_score);