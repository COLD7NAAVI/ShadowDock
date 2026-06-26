-- ============================================
-- ShadowDock Database Migration
-- Migration: 002_create_devices.sql
-- Description: Registered user devices
-- ============================================

CREATE TABLE IF NOT EXISTS devices (

    -- ============================================================
    -- Internal Identity
    -- ============================================================

    id UUID PRIMARY KEY
        DEFAULT gen_random_uuid(),

    -- Public Device ID
    public_id VARCHAR(24)
        NOT NULL
        UNIQUE,

    -- ============================================================
    -- Relationships
    -- ============================================================

    user_id UUID
        NOT NULL,

    -- ============================================================
    -- Device Information
    -- ============================================================

    device_name VARCHAR(100)
        NOT NULL,

    manufacturer VARCHAR(100),

    model VARCHAR(100),

    device_type VARCHAR(30)
        NOT NULL,

    operating_system VARCHAR(50),

    os_version VARCHAR(50),

    app_version VARCHAR(20),

    cpu_architecture VARCHAR(30),

    -- ============================================================
    -- Device Identity
    -- ============================================================

    device_identifier TEXT
        UNIQUE,

    trusted BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    -- ============================================================
    -- Push Notifications
    -- ============================================================

    push_provider VARCHAR(30),

    push_token TEXT,

    -- ============================================================
    -- Encryption
    -- One identity key per device.
    -- ============================================================

    public_key TEXT,

    encryption_version SMALLINT,

    -- ============================================================
    -- Activity
    -- ============================================================

    last_active TIMESTAMPTZ
        DEFAULT NOW(),

    last_ip_address INET,

    last_user_agent TEXT,

    -- ============================================================
    -- Revocation
    -- ============================================================

    revoked_at TIMESTAMPTZ,

    revoked_by UUID,

    revocation_reason TEXT,

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

    FOREIGN KEY (revoked_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    -- ============================================================
    -- Constraints
    -- ============================================================

    CONSTRAINT chk_device_type
        CHECK (
            device_type IN (
                'desktop',
                'laptop',
                'mobile',
                'tablet',
                'server',
                'web',
                'embedded'
            )
        ),

    CONSTRAINT chk_push_provider
        CHECK (
            push_provider IS NULL
            OR push_provider IN (
                'firebase',
                'apns',
                'webpush',
                'none'
            )
        )

);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_devices_public_id
ON devices(public_id);

CREATE INDEX idx_devices_user
ON devices(user_id);

CREATE INDEX idx_devices_identifier
ON devices(device_identifier);

CREATE INDEX idx_devices_last_active
ON devices(last_active);

CREATE INDEX idx_devices_trusted
ON devices(trusted);

CREATE INDEX idx_devices_deleted
ON devices(deleted_at);