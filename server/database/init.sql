-- ================================================================
-- ShadowDock Database Initialization
-- File: init.sql
--
-- Description:
-- Master installer for the ShadowDock database.
--
-- Responsibilities
--  • Enable PostgreSQL extensions
--  • Install helper functions
--  • Install ID generators
--  • Install timestamp functions
--  • Run database migrations
--  • Create update triggers
--
-- Safe to run multiple times.
-- ================================================================

BEGIN;

-- ================================================================
-- PostgreSQL Extensions
-- ================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- Required Functions
-- ================================================================

\echo ''
\echo 'Installing helper functions...'

\ir functions/helpers.sql

\echo 'Installing public ID generator...'

\ir functions/generate_public_id.sql

\echo 'Installing timestamp function...'

\ir functions/update_timestamp.sql

-- ================================================================
-- Core Database Migrations
-- ================================================================

\echo ''
\echo 'Running database migrations...'

------------------------------------------------------------
-- Users
------------------------------------------------------------

\ir migrations/001_create_users.sql

------------------------------------------------------------
-- Devices
------------------------------------------------------------

\ir migrations/002_create_devices.sql

------------------------------------------------------------
-- Sessions
------------------------------------------------------------

\ir migrations/003_create_sessions.sql

------------------------------------------------------------
-- Chats
------------------------------------------------------------

\ir migrations/004_create_chats.sql

------------------------------------------------------------
-- Chat Members
------------------------------------------------------------

\ir migrations/005_create_chat_members.sql

------------------------------------------------------------
-- Messages
------------------------------------------------------------

\ir migrations/006_create_messages.sql

------------------------------------------------------------
-- Attachments
------------------------------------------------------------

\ir migrations/007_create_attachments.sql

------------------------------------------------------------
-- Reactions
------------------------------------------------------------

\ir migrations/008_create_reactions.sql

------------------------------------------------------------
-- Notifications
------------------------------------------------------------

\ir migrations/009_create_notifications.sql

------------------------------------------------------------
-- Friendships
------------------------------------------------------------

\ir migrations/020_create_friendships.sql

-- ================================================================
-- Install Update Triggers
-- ================================================================

\echo ''
\echo 'Creating automatic timestamp triggers...'

\ir triggers/update_timestamp_trigger.sql

-- ================================================================
-- Verification
-- ================================================================

\echo ''
\echo 'Verifying installation...'

DO
$$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
    ) THEN
        RAISE EXCEPTION 'Users table was not created.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'messages'
    ) THEN
        RAISE EXCEPTION 'Messages table was not created.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'attachments'
    ) THEN
        RAISE EXCEPTION 'Attachments table was not created.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'notifications'
    ) THEN
        RAISE EXCEPTION 'Notifications table was not created.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'friendships'
    ) THEN
        RAISE EXCEPTION 'Friendships table was not created.';
    END IF;

END;
$$;

-- ================================================================
-- Installation Summary
-- ================================================================

\echo ''
\echo '============================================================'
\echo ' ShadowDock Database Installed Successfully'
\echo '============================================================'
\echo ''

\echo 'Installed Components'
\echo '--------------------'

\echo '✓ PostgreSQL Extensions'
\echo '✓ Helper Functions'
\echo '✓ Public ID Generator'
\echo '✓ Timestamp Function'

\echo ''

\echo '✓ Users'
\echo '✓ Devices'
\echo '✓ Sessions'
\echo '✓ Chats'
\echo '✓ Chat Members'
\echo '✓ Messages'
\echo '✓ Attachments'
\echo '✓ Reactions'
\echo '✓ Notifications'

\echo ''

\echo '✓ Automatic Update Triggers'

\echo ''

\echo 'ShadowDock Database Version : 1.0'
\echo 'Status : Production Ready'
\echo ''

COMMIT;

-- ================================================================
-- Future Migration Notes
-- ================================================================
--
-- Upcoming Infrastructure
--
-- 010_create_call_sessions.sql
-- 011_create_message_receipts.sql
-- 012_create_typing_status.sql
-- 013_create_presence.sql
-- 014_create_search_index.sql
-- 015_create_message_threads.sql
-- 016_create_polls.sql
-- 017_create_bookmarks.sql
-- 018_create_reports.sql
-- 019_create_blocks.sql
-- 020_create_friendships.sql
-- 021_create_invites.sql
-- 022_create_api_keys.sql
-- 023_create_audit_logs.sql
-- 024_create_background_jobs.sql
-- 025_create_ai_features.sql
--
-- These migrations are intentionally reserved to keep the
-- migration history clean and scalable as ShadowDock evolves.
--
-- ================================================================
-- End of ShadowDock Database Initialization
-- ================================================================