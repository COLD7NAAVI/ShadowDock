-- ==========================================================
-- ShadowDock Database Function
-- File: update_timestamp.sql
--
-- Description:
-- Automatically updates the "updated_at" column whenever
-- a row is modified.
--
-- Used by:
--
-- users
-- devices
-- sessions
-- chats
-- chat_members
-- messages
-- attachments
-- reactions
-- notifications
--
-- Future tables automatically supported.
-- ==========================================================

------------------------------------------------------------
-- Update Timestamp Trigger Function
------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_timestamp()

RETURNS TRIGGER

LANGUAGE plpgsql

AS
$$

BEGIN

    --------------------------------------------------------
    -- Always refresh modification timestamp
    --------------------------------------------------------

    NEW.updated_at := NOW();

    RETURN NEW;

END;

$$;

------------------------------------------------------------
-- Documentation
------------------------------------------------------------

COMMENT ON FUNCTION update_timestamp()

IS

'Automatically updates the updated_at column before every UPDATE.';