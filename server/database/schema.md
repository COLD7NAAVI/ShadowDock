# ShadowDock Database Schema

> Complete architecture documentation for the ShadowDock PostgreSQL database.

---

# Overview

The ShadowDock database is designed as a production-grade relational database capable of supporting:

- Millions of users
- Millions of chats
- Billions of messages
- Multi-device synchronization
- End-to-End Encryption
- AI-powered features
- Enterprise scalability

The schema follows a modular migration system where every database change is versioned and applied incrementally.

---

# Database Architecture

```
Users
 │
 ├──────────────┐
 │              │
 ▼              ▼
Devices      Sessions
 │
 │
 ▼
Chats
 │
 ▼
Chat Members
 │
 ▼
Messages
 │
 ├──────────────┐
 │              │
 ▼              ▼
Attachments   Reactions
 │
 ▼
Notifications
```

---

# Migration Order

| Migration | Purpose |
|-----------|---------|
|001|Users|
|002|Devices|
|003|Sessions|
|004|Chats|
|005|Chat Members|
|006|Messages|
|007|Attachments|
|008|Reactions|
|009|Notifications|

The migration order must never be changed after release.

Future changes are introduced using new migration numbers.

---

# Folder Structure

```
server/
└── database/

    functions/

    triggers/

    migrations/

    init.sql

    schema.md

    README.md
```

---

# Entity Summary

| Table | Description |
|--------|-------------|
|users|Application users|
|devices|Trusted user devices|
|sessions|Refresh token sessions|
|chats|Conversation containers|
|chat_members|User membership inside chats|
|messages|Chat messages|
|attachments|Files attached to messages|
|reactions|Emoji reactions|
|notifications|User notification queue|

---

# Primary Keys

Every entity uses:

```
UUID
```

Example

```
id UUID PRIMARY KEY
```

Advantages:

- globally unique
- replication friendly
- difficult to enumerate
- API safe

---

# Public IDs

Every externally visible resource also contains:

```
public_id
```

Examples:

```
usr_A81KD29F

chat_KQ92JD8A

msg_X92LS81Q

att_P81LWK90
```

Public IDs are generated using the database helper function:

```
generate_public_id()
```

Internal UUID values are never exposed through public APIs.

---
# Table Relationships

```
users
 ├────────────── devices
 │
 ├────────────── sessions
 │
 ├────────────── chats (owner)
 │
 ├────────────── chat_members
 │
 ├────────────── messages
 │
 ├────────────── reactions
 │
 └────────────── notifications
```

---

# Entity Relationships

## users

Purpose:

Stores every registered ShadowDock account.

Relationships:

```
users

├── devices

├── sessions

├── chat_members

├── messages

├── reactions

└── notifications
```

Primary Key

```
id UUID
```

Public Identifier

```
public_id
```

Indexes

- username
- email
- status
- created_at

---

## devices

Purpose

Tracks every trusted device that has logged into an account.

Examples

- Windows
- Linux
- Android
- iOS
- Web

Relationships

```
users

└── devices
```

Important Fields

- device_name
- platform
- push_token
- fingerprint
- last_active_at

Indexes

- user_id
- platform
- last_active_at

---

## sessions

Purpose

Secure refresh-token session management.

Relationships

```
users

└── sessions

      │

      ▼

devices
```

Supports

- multiple devices
- session revocation
- refresh tokens
- device-aware authentication

Indexes

- user_id
- device_id
- expires_at
- revoked

---

## chats

Purpose

Container representing a conversation.

Supported Types

```
private

group

community

channel

saved

bot
```

Relationships

```
users

   │

owner_id

   │

   ▼

 chats

   │

   ├──────── messages

   └──────── chat_members
```

Indexes

- public_id
- owner_id
- chat_type
- created_at

---

## chat_members

Purpose

Defines which users belong to each chat.

Relationships

```
users

      ▲

      │

chat_members

      │

      ▼

chats
```

Stores

- role
- notification preferences
- read position
- mute state
- archive state
- permissions
- pinned state

Indexes

- chat_id
- user_id
- role
- last_read_message_id

---

## messages

Purpose

Stores every message sent inside ShadowDock.

Relationships

```
messages

├── attachments

├── reactions

└── reply_to_message_id
```

Supports

- replies
- forwards
- edits
- deletions
- encryption metadata
- AI generated messages
- scheduled messages

Indexes

- chat_id
- sender_id
- created_at
- message_type
- delivery_status

---
## attachments

Purpose

Stores metadata for every file attached to a message.

Relationships

```
messages

    │

    ▼

attachments
```

Supported Types

- Image
- Video
- Audio
- Voice
- Document
- Archive
- GIF
- Sticker

Future Ready

- CDN storage
- Object storage
- IPFS
- OCR
- Virus scanning
- AI metadata
- Thumbnail generation
- Streaming
- Deduplication

Indexes

- message_id
- uploaded_by
- attachment_type
- storage_provider
- created_at

---

## reactions

Purpose

Stores emoji reactions on messages.

Relationships

```
messages

     ▲

     │

reactions

     │

     ▼

users
```

Supports

- Unlimited emojis
- Multiple reaction types
- Bot reactions
- Analytics
- Thread reactions
- Multi-device synchronization

Indexes

- message_id
- user_id
- emoji
- created_at

---

## notifications

Purpose

Queues notifications that should be delivered to users.

Relationships

```
users

    ▲

    │

notifications
```

Supports

- Push notifications
- Email
- SMS (optional)
- Rich notifications
- Deep links
- Retry queue
- Offline delivery
- Priority notifications

Indexes

- user_id
- notification_type
- priority
- read_at
- delivered_at
- created_at

---

# Foreign Key Strategy

ShadowDock intentionally uses different deletion policies depending on the relationship.

## CASCADE

Used when dependent data has no meaning without its parent.

Examples

```
users
    │
    └── sessions

messages
    │
    └── attachments

messages
    │
    └── reactions
```

---

## SET NULL

Used when preserving historical data is more important than removing references.

Examples

```
reply_to_message_id

forwarded_from_message_id

deleted_by

edited_by
```

This keeps conversations readable even when referenced content disappears.

---

# Timestamp Strategy

Every major entity includes:

```
created_at

updated_at
```

Lifecycle timestamps are added where appropriate.

Examples

```
deleted_at

edited_at

expires_at

joined_at

left_at

last_seen

muted_until

read_at

delivered_at
```

The `updated_at` column is maintained automatically using PostgreSQL triggers.

---

# Trigger Architecture

A shared trigger function updates timestamps before every UPDATE.

```
update_timestamp()
```

Applied to:

- users
- devices
- sessions
- chats
- chat_members
- messages
- attachments
- reactions
- notifications

This ensures consistent modification tracking across the database.

---

# Indexing Strategy

Indexes are created only for high-frequency queries.

Typical indexed columns include:

- UUID foreign keys
- public_id
- username
- email
- chat_id
- sender_id
- message_id
- created_at
- notification status
- delivery status
- attachment type
- role
- unread state

This balances read performance with write overhead.

---

# Performance Philosophy

The schema is optimized for the operations performed most often in a messaging platform.

Examples

- Opening conversations
- Loading recent messages
- Sending messages
- Uploading attachments
- Loading reactions
- Authenticating sessions
- Synchronizing devices
- Delivering notifications

The goal is predictable performance under very high workloads while keeping migrations maintainable.

---
# Naming Conventions

ShadowDock follows strict database naming conventions.

---

## Tables

Use plural nouns.

Examples

```
users
devices
sessions
chats
chat_members
messages
attachments
reactions
notifications
```

---

## Columns

Use lowercase snake_case.

Examples

```
public_id

created_at

updated_at

deleted_at

message_type

notification_type

last_read_message_id
```

---

## Primary Keys

Every table uses

```
id UUID PRIMARY KEY
```

---

## Public Identifiers

Every externally visible entity includes

```
public_id
```

Examples

```
usr_A91KX82Q

chat_P82KL91A

msg_X91LQ28D

att_M82AZ91Q

react_P82AK91M

notif_D81PL92Q
```

---

## Constraints

Constraint naming convention

```
pk_

fk_

chk_

uq_
```

Examples

```
fk_messages_chat

fk_messages_sender

chk_message_type

uq_chat_member
```

---

## Index Naming

Index naming convention

```
idx_<table>_<column>
```

Examples

```
idx_users_username

idx_messages_chat

idx_messages_created

idx_notifications_user

idx_reactions_message
```

---

# Security Principles

The database is designed with security as a primary objective.

Implemented strategies include

- UUID primary keys
- Public IDs
- Foreign key integrity
- Refresh-token sessions
- Device-aware authentication
- Automatic timestamp auditing
- Soft deletion
- Encryption-ready metadata

Sensitive information is never intended to be exposed directly through public APIs.

---

# Scalability Principles

The schema is intentionally designed to scale horizontally and vertically.

Target capacity

```
Millions of users

Millions of chats

Billions of messages

Billions of reactions

Billions of attachments

Billions of notifications
```

Indexes are optimized for common read operations while maintaining acceptable write performance.

---

# Future Database Roadmap

Reserved migrations

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

Future versions may also introduce

- Full-text search
- Vector search for AI
- Message translation
- Voice transcription
- Video call history
- Enterprise workspaces
- Federated servers
- Distributed object storage
- Data retention policies
- Advanced analytics
- Audit dashboards

---

# Design Philosophy

The ShadowDock database follows several core engineering principles.

## Security First

Protect user data through strong identifiers, integrity constraints, and secure session architecture.

---

## Performance First

Optimize for the most common messaging operations with efficient indexing and normalized relationships.

---

## Future First

Introduce extensibility from the beginning so that new features require additive migrations rather than structural redesign.

---

## Maintainability

Keep the schema modular, readable, versioned, and fully documented.

---

## Reliability

Favor explicit relationships, clear constraints, and predictable migration ordering to reduce operational risk.

---

# Version

```
Database Version : 1.0

Database Engine : PostgreSQL

Migration Count : 9

Infrastructure Files : 6
```

---

# Database Status

```
✓ Production-ready architecture

✓ Migration-based versioning

✓ UUID-first design

✓ Public ID support

✓ Automatic timestamps

✓ Trigger framework

✓ High-performance indexing

✓ Multi-device ready

✓ End-to-End Encryption ready

✓ AI-ready architecture

✓ Enterprise scalable
```

---

> **ShadowDock Database Foundation v1.0**

Built for Everyone.

Controlled by No One.

---