# ShadowDock Database

> Production-grade PostgreSQL database architecture powering ShadowDock.

---

# Overview

The ShadowDock database is designed for:

- High scalability
- Security
- Maintainability
- End-to-End Encryption readiness
- Multi-device synchronization
- Future AI integration
- Billions of messages

Rather than being designed only for today's features, the schema is intentionally built to support years of future development without major structural changes.

---

# Features

## Users

- User accounts
- Public IDs
- Account numbers
- Profiles
- Presence
- Status
- Soft deletion support

---

## Devices

- Unlimited trusted devices
- Device fingerprints
- Push notification tokens
- Platform tracking
- Last active tracking

---

## Sessions

- Refresh token sessions
- Device binding
- Secure login tracking
- Revocation support

---

## Chats

Supports:

- Private chats
- Groups
- Communities
- Channels
- Saved Messages
- Bot chats

Future-ready for:

- Broadcast channels
- Enterprise workspaces
- AI conversations

---

## Messages

Supports:

- Text
- Images
- Videos
- Voice notes
- Audio
- Documents
- GIFs
- Stickers
- Contacts
- Location
- Polls
- System messages
- Bot messages

Advanced capabilities:

- Replies
- Forwarding
- Thread-ready architecture
- Scheduled messages
- Soft deletion
- Editing
- Encryption metadata

---

## Attachments

Supports:

- Images
- Videos
- Audio
- Voice
- Documents
- Archives
- GIFs
- Stickers

Future-ready for:

- CDN
- IPFS
- OCR
- AI metadata
- Virus scanning
- Thumbnail generation
- Streaming
- Deduplication

---
## Reactions

Supports:

- Unlimited emoji reactions
- Analytics ready
- Bot reactions
- Thread reactions
- Future premium emoji packs
- Multi-device synchronization

---

## Notifications

Supports:

- Push notifications
- Email notifications
- SMS notifications (optional)
- Rich notifications
- Deep links
- Retry queue
- Offline queue
- Priority notifications

---

# Database Structure

```
server/
└── database/
    ├── functions/
    │
    │   generate_public_id.sql
    │   update_timestamp.sql
    │   helpers.sql
    │
    ├── triggers/
    │
    │   update_timestamp_trigger.sql
    │
    ├── migrations/
    │
    │   001_create_users.sql
    │   002_create_devices.sql
    │   003_create_sessions.sql
    │   004_create_chats.sql
    │   005_create_chat_members.sql
    │   006_create_messages.sql
    │   007_create_attachments.sql
    │   008_create_reactions.sql
    │   009_create_notifications.sql
    │
    ├── init.sql
    ├── schema.md
    └── README.md
```

---

# Installation

Open PostgreSQL.

Connect to your database.

Run:

```sql
\i init.sql
```

The installer automatically:

- Enables required extensions
- Installs helper functions
- Installs public ID generator
- Installs timestamp function
- Creates every table
- Creates every trigger
- Verifies installation

---

# Migration Order

Migrations are intentionally executed in dependency order.

```
001 Users

↓

002 Devices

↓

003 Sessions

↓

004 Chats

↓

005 Chat Members

↓

006 Messages

↓

007 Attachments

↓

008 Reactions

↓

009 Notifications
```

Never change migration numbers after release.

Always create new migrations.

---

# Design Principles

ShadowDock follows several engineering principles.

## Security First

- UUID primary keys
- Public IDs
- Refresh-token sessions
- Device-aware authentication
- Encryption-ready metadata

---

## Scale First

Designed for:

- Millions of users
- Millions of chats
- Billions of messages
- Billions of attachments
- Billions of reactions

Indexes are intentionally added for high-frequency queries.

---

## Future First

The schema intentionally includes support for future features before they are implemented.

Examples include:

- AI messages
- OCR
- CDN storage
- Virus scanning
- IPFS
- Scheduled messages
- Threads
- Rich notifications
- Analytics
- Enterprise workspaces
---

# Naming Conventions

## Tables

Use plural nouns.

Examples:

```
users
devices
sessions
chats
messages
attachments
reactions
notifications
```

---

## Primary Keys

Every table uses:

```
id UUID PRIMARY KEY
```

---

## Public IDs

Every externally exposed entity has a public identifier.

Examples:

```
usr_A91XKD72
chat_F82JKL92
msg_P91LMQ28
att_M81QWA72
```

Internal UUIDs are never exposed through public APIs.

---

## Timestamps

Every major table includes:

```
created_at
updated_at
```

Most entities also include lifecycle timestamps where applicable:

- deleted_at
- edited_at
- expires_at
- archived_at
- last_seen
- muted_until

Automatic updates are handled using PostgreSQL triggers.

---

## Foreign Keys

Every relationship uses explicit foreign key constraints.

Deletion behavior is chosen intentionally:

- `CASCADE` when dependent data should disappear
- `SET NULL` when historical integrity should remain
- `RESTRICT` (future) for protected entities

---

# Performance

The schema is optimized for common operations.

Examples:

- Recent messages
- Chat loading
- User lookup
- Session validation
- Device lookup
- Attachment retrieval
- Notification delivery

Frequently queried columns are indexed.

The database is designed to remain performant even with very large datasets.

---

# Future Roadmap

Reserved migration numbers:

```
010_create_call_sessions.sql

011_create_message_receipts.sql

012_create_typing_status.sql

013_create_presence.sql

014_create_search_index.sql

015_create_message_threads.sql

016_create_polls.sql

017_create_bookmarks.sql

018_create_reports.sql

019_create_blocks.sql

020_create_friendships.sql

021_create_invites.sql

022_create_api_keys.sql

023_create_audit_logs.sql

024_create_background_jobs.sql

025_create_ai_features.sql
```

Future migrations will never modify historical migration files.

Only new migrations will be added.

---

# Contributing

When extending the database:

- Never edit released migrations.
- Create a new numbered migration.
- Keep naming consistent.
- Add indexes where appropriate.
- Document new tables.
- Maintain backward compatibility whenever possible.

---

# Philosophy

ShadowDock is designed with a long-term engineering mindset.

The database prioritizes:

- Security
- Reliability
- Scalability
- Performance
- Maintainability
- Future extensibility

Every schema decision aims to reduce future migrations and simplify long-term development.

---

# Version

Current Database Version:

```
1.0
```

---

Built for Everyone.

Controlled by No One.

---