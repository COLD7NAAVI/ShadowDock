-- ==========================================================
-- ShadowDock Database Migration
-- Migration: 007_create_attachments.sql
-- Description: Create attachments table
-- ==========================================================

CREATE TABLE IF NOT EXISTS attachments (

    ----------------------------------------------------------
    -- Internal Identifier
    ----------------------------------------------------------

    id UUID PRIMARY KEY
        DEFAULT gen_random_uuid(),

    ----------------------------------------------------------
    -- Public Identifier
    -- Example:
    -- att_H3A9LQ2P8R
    ----------------------------------------------------------

    public_id VARCHAR(20)
        NOT NULL
        UNIQUE,

    ----------------------------------------------------------
    -- Relationships
    ----------------------------------------------------------

    message_id UUID
        NOT NULL,

    uploader_id UUID
        NOT NULL,

    ----------------------------------------------------------
    -- Public Sender Snapshot
    ----------------------------------------------------------

    uploader_public_id VARCHAR(20)
        NOT NULL,

    ----------------------------------------------------------
    -- Attachment Type
    ----------------------------------------------------------

    attachment_type VARCHAR(20)
        NOT NULL,

    ----------------------------------------------------------
    -- File Information
    ----------------------------------------------------------

    original_filename TEXT
        NOT NULL,

    stored_filename TEXT
        NOT NULL,

    file_extension VARCHAR(20),

    mime_type VARCHAR(100)
        NOT NULL,

    file_size BIGINT
        NOT NULL,

    ----------------------------------------------------------
    -- File Integrity
    ----------------------------------------------------------

    sha256_hash TEXT
        NOT NULL
        UNIQUE,

    perceptual_hash TEXT,

    ----------------------------------------------------------
    -- Storage Provider
    ----------------------------------------------------------

    storage_provider VARCHAR(20)
        NOT NULL
        DEFAULT 'local',

    storage_path TEXT
        NOT NULL,

    public_url TEXT,

    cdn_url TEXT,

    ----------------------------------------------------------
    -- Preview Files
    ----------------------------------------------------------

    thumbnail_path TEXT,

    preview_path TEXT,

    preview_generated BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    thumbnail_generated BOOLEAN
        NOT NULL
        DEFAULT FALSE,

        ----------------------------------------------------------
    -- Image Information
    ----------------------------------------------------------

    image_width INTEGER,

    image_height INTEGER,

    image_format VARCHAR(20),

    ----------------------------------------------------------
    -- Video Information
    ----------------------------------------------------------

    duration_seconds INTEGER,

    video_width INTEGER,

    video_height INTEGER,

    frame_rate NUMERIC(6,2),

    bitrate INTEGER,

    codec VARCHAR(50),

    ----------------------------------------------------------
    -- Audio Information
    ----------------------------------------------------------

    sample_rate INTEGER,

    audio_channels SMALLINT,

    ----------------------------------------------------------
    -- Document Information
    ----------------------------------------------------------

    page_count INTEGER,

    language VARCHAR(20),

    ----------------------------------------------------------
    -- OCR / AI Metadata
    ----------------------------------------------------------

    extracted_text TEXT,

    ai_description TEXT,

    ai_tags JSONB
        NOT NULL
        DEFAULT '[]'::jsonb,

    metadata JSONB
        NOT NULL
        DEFAULT '{}'::jsonb,

    ----------------------------------------------------------
    -- Encryption
    ----------------------------------------------------------

    encrypted BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    encryption_version SMALLINT,

    encryption_algorithm VARCHAR(50),

    file_nonce TEXT,

    encrypted_key TEXT,

    ----------------------------------------------------------
    -- Compression
    ----------------------------------------------------------

    compressed BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    compression_algorithm VARCHAR(30),

    ----------------------------------------------------------
    -- Upload State
    ----------------------------------------------------------

    upload_status VARCHAR(20)
        NOT NULL
        DEFAULT 'uploading',

    uploaded_at TIMESTAMPTZ,

    upload_completed_at TIMESTAMPTZ,

    ----------------------------------------------------------
    -- Virus Scan
    ----------------------------------------------------------

    virus_scan_status VARCHAR(20)
        NOT NULL
        DEFAULT 'pending',

    scanned_at TIMESTAMPTZ,

    ----------------------------------------------------------
    -- Download Statistics
    ----------------------------------------------------------

    download_count BIGINT
        NOT NULL
        DEFAULT 0,

    last_downloaded_at TIMESTAMPTZ,

    ----------------------------------------------------------
    -- Attachment State
    ----------------------------------------------------------

    deleted_at TIMESTAMPTZ,

    deleted_by UUID,

    restored_at TIMESTAMPTZ,

    restored_by UUID,

    ----------------------------------------------------------
    -- Audit
    ----------------------------------------------------------

    created_by UUID,

    updated_by UUID,

    created_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    ----------------------------------------------------------
    -- Relationships
    ----------------------------------------------------------

    FOREIGN KEY (message_id)
        REFERENCES messages(id)
        ON DELETE CASCADE,

    FOREIGN KEY (uploader_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

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
-- Attachment Type Validation
--------------------------------------------------------------

ALTER TABLE attachments
ADD CONSTRAINT chk_attachment_type
CHECK (
    attachment_type IN (
        'image',
        'video',
        'audio',
        'voice',
        'document',
        'archive',
        'sticker',
        'gif',
        'thumbnail',
        'avatar',
        'profile_banner',
        'system',
        'other'
    )
);

--------------------------------------------------------------
-- Storage Provider Validation
--------------------------------------------------------------

ALTER TABLE attachments
ADD CONSTRAINT chk_storage_provider
CHECK (
    storage_provider IN (
        'local',
        's3',
        'r2',
        'azure',
        'gcs',
        'ipfs'
    )
);

--------------------------------------------------------------
-- Upload Status Validation
--------------------------------------------------------------

ALTER TABLE attachments
ADD CONSTRAINT chk_upload_status
CHECK (
    upload_status IN (
        'uploading',
        'processing',
        'completed',
        'failed',
        'deleted'
    )
);

--------------------------------------------------------------
-- Virus Scan Validation
--------------------------------------------------------------

ALTER TABLE attachments
ADD CONSTRAINT chk_virus_scan
CHECK (
    virus_scan_status IN (
        'pending',
        'clean',
        'infected',
        'failed'
    )
);

--------------------------------------------------------------
-- Encryption Validation
--------------------------------------------------------------

ALTER TABLE attachments
ADD CONSTRAINT chk_attachment_encryption_version
CHECK (
    encryption_version IS NULL
    OR encryption_version >= 1
);

--------------------------------------------------------------
-- Download Counter Validation
--------------------------------------------------------------

ALTER TABLE attachments
ADD CONSTRAINT chk_download_count
CHECK (
    download_count >= 0
);

--------------------------------------------------------------
-- File Size Validation
--------------------------------------------------------------

ALTER TABLE attachments
ADD CONSTRAINT chk_file_size
CHECK (
    file_size > 0
);

--------------------------------------------------------------
-- Timestamp Validation
--------------------------------------------------------------

ALTER TABLE attachments
ADD CONSTRAINT chk_upload_completed
CHECK (
    upload_completed_at IS NULL
    OR uploaded_at IS NOT NULL
);

ALTER TABLE attachments
ADD CONSTRAINT chk_deleted_time
CHECK (
    deleted_at IS NULL
    OR deleted_at >= created_at
);

ALTER TABLE attachments
ADD CONSTRAINT chk_restored_time
CHECK (
    restored_at IS NULL
    OR deleted_at IS NOT NULL
);

--------------------------------------------------------------
-- Public ID Validation
--------------------------------------------------------------

ALTER TABLE attachments
ADD CONSTRAINT chk_attachment_public_id
CHECK (
    public_id LIKE 'att_%'
);

-- ==========================================================
-- Indexes
-- ==========================================================

--------------------------------------------------------------
-- Primary Lookup
--------------------------------------------------------------

CREATE INDEX idx_attachments_public_id
ON attachments(public_id);

--------------------------------------------------------------
-- Message Attachments
--------------------------------------------------------------

CREATE INDEX idx_attachments_message
ON attachments(message_id);

--------------------------------------------------------------
-- Uploader
--------------------------------------------------------------

CREATE INDEX idx_attachments_uploader
ON attachments(uploader_id);

--------------------------------------------------------------
-- Attachment Type
--------------------------------------------------------------

CREATE INDEX idx_attachments_type
ON attachments(attachment_type);

--------------------------------------------------------------
-- Storage Provider
--------------------------------------------------------------

CREATE INDEX idx_attachments_storage
ON attachments(storage_provider);

--------------------------------------------------------------
-- MIME Type
--------------------------------------------------------------

CREATE INDEX idx_attachments_mime
ON attachments(mime_type);

--------------------------------------------------------------
-- Upload Status
--------------------------------------------------------------

CREATE INDEX idx_attachments_upload_status
ON attachments(upload_status);

--------------------------------------------------------------
-- Virus Scan
--------------------------------------------------------------

CREATE INDEX idx_attachments_scan_status
ON attachments(virus_scan_status);

--------------------------------------------------------------
-- Encryption
--------------------------------------------------------------

CREATE INDEX idx_attachments_encrypted
ON attachments(encrypted);

--------------------------------------------------------------
-- Soft Delete
--------------------------------------------------------------

CREATE INDEX idx_attachments_deleted
ON attachments(deleted_at)
WHERE deleted_at IS NOT NULL;

--------------------------------------------------------------
-- Upload Timeline
--------------------------------------------------------------

CREATE INDEX idx_attachments_created
ON attachments(created_at);

--------------------------------------------------------------
-- SHA-256 Lookup
--------------------------------------------------------------

CREATE INDEX idx_attachments_sha256
ON attachments(sha256_hash);

--------------------------------------------------------------
-- OCR Search
--------------------------------------------------------------

CREATE INDEX idx_attachments_ocr
ON attachments
USING GIN (
    to_tsvector(
        'simple',
        COALESCE(extracted_text, '')
    )
);

--------------------------------------------------------------
-- AI Tags
--------------------------------------------------------------

CREATE INDEX idx_attachments_ai_tags
ON attachments
USING GIN (ai_tags);

--------------------------------------------------------------
-- Metadata
--------------------------------------------------------------

CREATE INDEX idx_attachments_metadata
ON attachments
USING GIN (metadata);

--------------------------------------------------------------
-- Composite Performance Indexes
--------------------------------------------------------------

CREATE INDEX idx_attachments_message_type
ON attachments(message_id, attachment_type);

CREATE INDEX idx_attachments_user_created
ON attachments(uploader_id, created_at DESC);

CREATE INDEX idx_attachments_status_created
ON attachments(upload_status, created_at DESC);

-- ==========================================================
-- Notes
--
-- One row represents one uploaded attachment.
--
-- Supports:
--
-- ✓ Images
-- ✓ Videos
-- ✓ Audio
-- ✓ Voice Notes
-- ✓ Documents
-- ✓ Archives
-- ✓ GIFs
-- ✓ Stickers
-- ✓ Profile Images
-- ✓ AI Metadata
-- ✓ OCR
-- ✓ E2EE Attachments
-- ✓ Deduplication
-- ✓ Cloud Storage
-- ✓ Local Storage
-- ✓ IPFS
-- ✓ CDN
-- ✓ Virus Scanning
-- ✓ Streaming
-- ✓ Thumbnail Generation
-- ✓ Preview Generation
-- ✓ Future Media Processing
--
-- Built for Everyone.
-- Controlled by No One.
--
-- ==========================================================