-- ================================================================
-- ShadowDock Database Migration
-- Migration: 010_fix_device_identifier_uniqueness.sql
--
-- Description:
-- Device identifiers must be unique per user, not globally.
--
-- Previous:
--     UNIQUE (device_identifier)
--
-- Correct:
--     UNIQUE (user_id, device_identifier)
--
-- Safe to run multiple times.
-- ================================================================

ALTER TABLE devices
DROP CONSTRAINT IF EXISTS devices_device_identifier_key;

ALTER TABLE devices
DROP CONSTRAINT IF EXISTS devices_user_device_identifier_key;

ALTER TABLE devices
ADD CONSTRAINT devices_user_device_identifier_key
UNIQUE (user_id, device_identifier);
