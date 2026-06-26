-- ==========================================================
-- ShadowDock Database Migration
-- Migration: 008_create_reactions.sql
-- Description: Create reactions table
-- ==========================================================

CREATE TABLE IF NOT EXISTS reactions (

    ----------------------------------------------------------
    -- Internal Identifier
    ----------------------------------------------------------

    id UUID PRIMARY KEY
        DEFAULT gen_random_uuid(),

    ----------------------------------------------------------
    -- Public Identifier
    -- Example:
    -- react_A8X3LQ91PK
    ----------------------------------------------------------

    public_id VARCHAR(20)
        NOT NULL
        UNIQUE,

    ----------------------------------------------------------
    -- Relationships
    ----------------------------------------------------------

    message_id UUID
        NOT NULL,

    user_id UUID
        NOT NULL,

    ----------------------------------------------------------
    -- Public User Snapshot
    ----------------------------------------------------------

    user_public_id VARCHAR(20)
        NOT NULL,

    ----------------------------------------------------------
    -- Reaction Information
    ----------------------------------------------------------

    reaction_type VARCHAR(30)
        NOT NULL
        DEFAULT 'emoji',

    reaction_value TEXT
        NOT NULL,

    ----------------------------------------------------------
    -- Emoji Information
    ----------------------------------------------------------

    emoji_unicode TEXT,

    emoji_shortcode VARCHAR(100),

    emoji_variant VARCHAR(30),

    emoji_pack VARCHAR(100),

    animated BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    premium BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    ----------------------------------------------------------
    -- Generator
    ----------------------------------------------------------

    generator_type VARCHAR(20)
        NOT NULL
        DEFAULT 'user',

    generator_id UUID,

    generator_name VARCHAR(64),

    ----------------------------------------------------------
    -- Display
    ----------------------------------------------------------

    display_order INTEGER
        NOT NULL
        DEFAULT 0,

    highlighted BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    ----------------------------------------------------------
    -- Metadata
    ----------------------------------------------------------

    metadata JSONB
        NOT NULL
        DEFAULT '{}'::jsonb,

    ----------------------------------------------------------
    -- State
    ----------------------------------------------------------

    active BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    removed_at TIMESTAMPTZ,

    removed_by UUID,

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
    -- Constraints
    ----------------------------------------------------------

    CONSTRAINT uq_message_user_reaction
        UNIQUE (
            message_id,
            user_id,
            reaction_value
        ),

    ----------------------------------------------------------
    -- Relationships
    ----------------------------------------------------------

    FOREIGN KEY (message_id)
        REFERENCES messages(id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (removed_by)
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
-- Validation
-- ==========================================================

------------------------------------------------------------
-- Generator Type
------------------------------------------------------------

ALTER TABLE reactions
ADD CONSTRAINT chk_reaction_generator
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
-- Reaction Type
------------------------------------------------------------

ALTER TABLE reactions
ADD CONSTRAINT chk_reaction_type
CHECK (
    reaction_type IN (
        'emoji',
        'custom_emoji',
        'sticker',
        'badge',
        'system',
        'bot',
        'ai'
    )
);

------------------------------------------------------------
-- Display Order
------------------------------------------------------------

ALTER TABLE reactions
ADD CONSTRAINT chk_reaction_display_order
CHECK (
    display_order >= 0
);

------------------------------------------------------------
-- Emoji Shortcode Length
------------------------------------------------------------

ALTER TABLE reactions
ADD CONSTRAINT chk_reaction_shortcode
CHECK (
    emoji_shortcode IS NULL
    OR length(emoji_shortcode) <= 100
);

------------------------------------------------------------
-- Active / Removed consistency
------------------------------------------------------------

ALTER TABLE reactions
ADD CONSTRAINT chk_reaction_state
CHECK (

    (
        active = TRUE
        AND removed_at IS NULL
    )

    OR

    (
        active = FALSE
        AND removed_at IS NOT NULL
    )

);

------------------------------------------------------------
-- Metadata must always be JSON object
------------------------------------------------------------

ALTER TABLE reactions
ADD CONSTRAINT chk_reaction_metadata
CHECK (
    jsonb_typeof(metadata) = 'object'
);
-- ==========================================================
-- Indexes
-- ==========================================================

------------------------------------------------------------
-- Public Lookup
------------------------------------------------------------

CREATE UNIQUE INDEX idx_reactions_public
ON reactions(public_id);

------------------------------------------------------------
-- Message Queries
------------------------------------------------------------

CREATE INDEX idx_reactions_message
ON reactions(message_id);

CREATE INDEX idx_reactions_message_active
ON reactions(message_id, active);

CREATE INDEX idx_reactions_message_created
ON reactions(message_id, created_at DESC);

------------------------------------------------------------
-- User Queries
------------------------------------------------------------

CREATE INDEX idx_reactions_user
ON reactions(user_id);

CREATE INDEX idx_reactions_user_created
ON reactions(user_id, created_at DESC);

------------------------------------------------------------
-- Emoji Queries
------------------------------------------------------------

CREATE INDEX idx_reactions_value
ON reactions(reaction_value);

CREATE INDEX idx_reactions_shortcode
ON reactions(emoji_shortcode);

------------------------------------------------------------
-- Type Queries
------------------------------------------------------------

CREATE INDEX idx_reactions_type
ON reactions(reaction_type);

CREATE INDEX idx_reactions_generator
ON reactions(generator_type);

------------------------------------------------------------
-- State Queries
------------------------------------------------------------

CREATE INDEX idx_reactions_active
ON reactions(active);

CREATE INDEX idx_reactions_removed
ON reactions(removed_at);

------------------------------------------------------------
-- Metadata
------------------------------------------------------------

CREATE INDEX idx_reactions_metadata
ON reactions
USING GIN(metadata);

------------------------------------------------------------
-- Composite Indexes
------------------------------------------------------------

CREATE INDEX idx_reactions_message_user
ON reactions(message_id, user_id);

CREATE INDEX idx_reactions_message_type
ON reactions(message_id, reaction_type);

CREATE INDEX idx_reactions_message_value
ON reactions(message_id, reaction_value);

------------------------------------------------------------
-- Partial Indexes
------------------------------------------------------------

CREATE INDEX idx_reactions_active_only
ON reactions(message_id)
WHERE active = TRUE;

CREATE INDEX idx_reactions_removed_only
ON reactions(removed_at)
WHERE removed_at IS NOT NULL;

------------------------------------------------------------
-- Future Ready
------------------------------------------------------------
--
-- ✓ Custom Emoji Packs
-- ✓ Animated Reactions
-- ✓ Sticker Reactions
-- ✓ AI Reactions
-- ✓ Bot Reactions
-- ✓ Premium Emoji
-- ✓ Reaction Analytics
-- ✓ Reaction Leaderboards
-- ✓ Frequently Used Emojis
-- ✓ Emoji Search
-- ✓ Emoji Categories
-- ✓ Emoji Skin Tones
-- ✓ Emoji Pack Marketplace
-- ✓ Enterprise Custom Emojis
-- ✓ Thread Reactions
-- ✓ Scheduled Reactions
-- ✓ Auto Reactions
-- ✓ API Generated Reactions
-- ✓ E2EE Compatible
-- ✓ Multi-device Sync
-- ✓ Offline Sync
-- ✓ High Scale Indexing
-- ✓ Billions of Reactions Ready
--
-- Built for Everyone.
-- Controlled by No One.
-- ==========================================================