-- ==========================================================
-- ShadowDock Database Trigger Installation
-- File: update_timestamp_trigger.sql
--
-- Description:
-- Installs automatic updated_at triggers for every table
-- containing an updated_at column.
--
-- Safe to execute multiple times.
-- ==========================================================

------------------------------------------------------------
-- USERS
------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;

CREATE TRIGGER trg_users_updated_at

BEFORE UPDATE

ON users

FOR EACH ROW

EXECUTE FUNCTION update_timestamp();

------------------------------------------------------------
-- DEVICES
------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_devices_updated_at ON devices;

CREATE TRIGGER trg_devices_updated_at

BEFORE UPDATE

ON devices

FOR EACH ROW

EXECUTE FUNCTION update_timestamp();

------------------------------------------------------------
-- SESSIONS
------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_sessions_updated_at ON sessions;

CREATE TRIGGER trg_sessions_updated_at

BEFORE UPDATE

ON sessions

FOR EACH ROW

EXECUTE FUNCTION update_timestamp();

------------------------------------------------------------
-- CHATS
------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_chats_updated_at ON chats;

CREATE TRIGGER trg_chats_updated_at

BEFORE UPDATE

ON chats

FOR EACH ROW

EXECUTE FUNCTION update_timestamp();

------------------------------------------------------------
-- CHAT MEMBERS
------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_chat_members_updated_at
ON chat_members;

CREATE TRIGGER trg_chat_members_updated_at

BEFORE UPDATE

ON chat_members

FOR EACH ROW

EXECUTE FUNCTION update_timestamp();

------------------------------------------------------------
-- MESSAGES
------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_messages_updated_at
ON messages;

CREATE TRIGGER trg_messages_updated_at

BEFORE UPDATE

ON messages

FOR EACH ROW

EXECUTE FUNCTION update_timestamp();

------------------------------------------------------------
-- ATTACHMENTS
------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_attachments_updated_at
ON attachments;

CREATE TRIGGER trg_attachments_updated_at

BEFORE UPDATE

ON attachments

FOR EACH ROW

EXECUTE FUNCTION update_timestamp();

------------------------------------------------------------
-- REACTIONS
------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_reactions_updated_at
ON reactions;

CREATE TRIGGER trg_reactions_updated_at

BEFORE UPDATE

ON reactions

FOR EACH ROW

EXECUTE FUNCTION update_timestamp();

------------------------------------------------------------
-- NOTIFICATIONS
------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_notifications_updated_at
ON notifications;

CREATE TRIGGER trg_notifications_updated_at

BEFORE UPDATE

ON notifications

FOR EACH ROW

EXECUTE FUNCTION update_timestamp();

------------------------------------------------------------
-- Documentation
------------------------------------------------------------

COMMENT ON TRIGGER trg_users_updated_at
ON users

IS 'Automatically updates updated_at before UPDATE.';

COMMENT ON TRIGGER trg_devices_updated_at
ON devices

IS 'Automatically updates updated_at before UPDATE.';

COMMENT ON TRIGGER trg_sessions_updated_at
ON sessions

IS 'Automatically updates updated_at before UPDATE.';

COMMENT ON TRIGGER trg_chats_updated_at
ON chats

IS 'Automatically updates updated_at before UPDATE.';

COMMENT ON TRIGGER trg_chat_members_updated_at
ON chat_members

IS 'Automatically updates updated_at before UPDATE.';

COMMENT ON TRIGGER trg_messages_updated_at
ON messages

IS 'Automatically updates updated_at before UPDATE.';

COMMENT ON TRIGGER trg_attachments_updated_at
ON attachments

IS 'Automatically updates updated_at before UPDATE.';

COMMENT ON TRIGGER trg_reactions_updated_at
ON reactions

IS 'Automatically updates updated_at before UPDATE.';

COMMENT ON TRIGGER trg_notifications_updated_at
ON notifications

IS 'Automatically updates updated_at before UPDATE.';