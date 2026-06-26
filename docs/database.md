# ShadowDock Database Design

## Overview

ShadowDock uses PostgreSQL as its primary relational database.

The database is designed with the following principles:

- Normalized schema
- Scalability
- Security
- Future-proof extensibility
- Minimal data duplication
- Efficient indexing

---

# Core Entities

1. Users
2. Devices
3. Sessions
4. Chats
5. Chat Members
6. Messages
7. Attachments
8. Reactions
9. Notifications

---

# Relationships

User
│
├── Devices
├── Sessions
├── Chat Members
│
Chat
│
├── Members
├── Messages
│
Message
│
├── Attachments
├── Reactions

---

# User

Represents a ShadowDock account.

Fields

- id
- username
- display_name
- email (optional)
- password_hash
- avatar
- bio
- status
- created_at
- updated_at
- last_seen

---

# Device

Represents one logged-in device.

Fields

- id
- user_id
- device_name
- device_type
- public_key
- last_active
- created_at

---

# Session

Represents an authenticated login session.

Fields

- id
- user_id
- device_id
- refresh_token_hash
- expires_at
- created_at

---

# Chat

Represents a conversation.

Types

- Private
- Group
- Channel

Fields

- id
- type
- created_at

---

# Chat Member

Connects users to chats.

Fields

- chat_id
- user_id
- role
- joined_at

Roles

- Owner
- Admin
- Moderator
- Member

---

# Message

Represents one message.

Fields

- id
- chat_id
- sender_id
- message_type
- content
- reply_to
- edited
- deleted
- created_at
- updated_at

---

# Attachment

Represents uploaded media.

Fields

- id
- message_id
- file_name
- file_size
- mime_type
- storage_path
- checksum

---

# Reaction

Represents emoji reactions.

Fields

- message_id
- user_id
- emoji

---

# Notification

Represents user notifications.

Fields

- id
- user_id
- type
- payload
- read
- created_at

---

# Future Extensions

The schema is intentionally designed to support:

- End-to-End Encryption
- Multi-device synchronization
- Voice calls
- Video calls
- Stories
- Communities
- Bots
- Self-hosted servers
- Future protocol upgrades

---

Built for Everyone. Controlled by No One.