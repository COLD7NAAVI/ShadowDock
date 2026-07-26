-- ================================================================
-- Migration: 020_create_friendships.sql
--
-- ShadowDock Messenger
--
-- Description
-- Creates the friendships table used for:
--
-- • Friend Requests
-- • Accepted Friends
-- • Blocked Relationships (future)
--
-- Safe to run multiple times.
-- ================================================================

CREATE TABLE IF NOT EXISTS friendships (

    id UUID
        PRIMARY KEY
        DEFAULT uuid_generate_v4(),

    public_id TEXT
        NOT NULL
        UNIQUE
        DEFAULT generate_public_id('frd'),

    requester_id UUID
        NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    addressee_id UUID
        NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    status TEXT
        NOT NULL
        DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'accepted',
                'blocked'
            )
        ),

    created_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    updated_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    CONSTRAINT friendships_no_self_request
        CHECK (
            requester_id <> addressee_id
        )
);
-- ================================================================
-- Prevent duplicate friendship pairs
-- ================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_friendships_unique_pair
ON friendships (

    LEAST(requester_id, addressee_id),

    GREATEST(requester_id, addressee_id)

);
-- ================================================================
-- Performance Indexes
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_friendships_requester
ON friendships (requester_id);

CREATE INDEX IF NOT EXISTS idx_friendships_addressee
ON friendships (addressee_id);

CREATE INDEX IF NOT EXISTS idx_friendships_status
ON friendships (status);

CREATE INDEX IF NOT EXISTS idx_friendships_created_at
ON friendships (created_at DESC);
-- ================================================================
-- Documentation
-- ================================================================

COMMENT ON TABLE friendships IS
'Stores friend requests and accepted friendships.';

COMMENT ON COLUMN friendships.requester_id IS
'User who initiated the friend request.';

COMMENT ON COLUMN friendships.addressee_id IS
'User receiving the friend request.';

COMMENT ON COLUMN friendships.status IS
'Friendship status: pending, accepted or blocked.';
-- ================================================================
-- Automatic updated_at
-- ================================================================

DROP TRIGGER IF EXISTS trg_friendships_updated_at
ON friendships;

CREATE TRIGGER trg_friendships_updated_at

BEFORE UPDATE

ON friendships

FOR EACH ROW

EXECUTE FUNCTION update_timestamp();