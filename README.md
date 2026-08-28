# ShadowDock

A self-hostable real-time messaging application built with React, Node.js, Socket.IO, PostgreSQL, Redis, and Docker.

ShadowDock is a full-stack messaging application focused on real-time communication, authenticated user sessions, private conversations, persistent message storage, and a containerized development environment.

The project follows a modular client-server architecture and is designed to be extensible for future features such as end-to-end encryption, multi-device synchronization, voice and video communication.

---

## ✨ Features

- 🔐 User authentication
- 👤 User profiles
- 💬 Private conversations
- ⚡ Real-time messaging with Socket.IO
- 💾 Persistent message storage
- 🔄 Session and refresh-token based authentication
- 🗄️ PostgreSQL database
- ⚡ Redis service support
- 🐳 Docker-based development environment
- 🔥 Hot reloading during development
- 🛡️ API validation
- 🚦 Rate limiting
- 🔌 REST API and WebSocket communication
- 🧩 Modular backend architecture
- 🧪 Testing structure for future automated tests

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- Axios
- Socket.IO Client

### Backend

- Node.js
- Express
- Socket.IO
- PostgreSQL
- Redis
- JWT
- bcrypt

### Infrastructure

- Docker
- Docker Compose
- WSL2 / Linux development environment

---

## 🏗️ Architecture

ShadowDock uses a client-server architecture with REST APIs for HTTP-based operations and Socket.IO for real-time communication.

```text
                    ┌─────────────────────────┐
                    │         Client          │
                    │      React + Vite       │
                    └────────────┬────────────┘
                                 │
                    HTTP / REST  │  Socket.IO
                                 ▼
                    ┌─────────────────────────┐
                    │         Server          │
                    │  Node.js + Express      │
                    │      + Socket.IO        │
                    └───────────┬───────┬─────┘
                                │       │
                                ▼       ▼
                     ┌──────────────┐ ┌──────────────┐
                     │ PostgreSQL   │ │    Redis     │
                     │   Database   │ │    Cache     │
                     └──────────────┘ └──────────────┘
```

---

## 🔄 Request Flow

```text
User
 │
 ▼
Client Application
 │
 ├── HTTP / REST ────────────────► Express API
 │
 └── Socket.IO ──────────────────► Socket Server
                                       │
                                       ▼
                               Application Services
                                       │
                              ┌────────┴────────┐
                              ▼                 ▼
                         PostgreSQL           Redis
```

The REST API handles operations such as authentication, user management, chat management, and other HTTP-based requests.

Socket.IO handles real-time communication, including message delivery and future real-time features.

---

## 🧠 Backend Responsibilities

The backend is responsible for:

- User registration and login
- Password hashing
- Access token generation
- Refresh token generation and rotation
- Session management
- User authorization
- Chat and conversation management
- Message persistence
- Real-time Socket.IO communication
- API validation
- Rate limiting
- Database access
- Redis integration

The backend follows a layered architecture to keep application logic separated from database operations and transport logic.

```text
Request
   │
   ▼
Routes
   │
   ▼
Controllers
   │
   ▼
Services
   │
   ▼
Repositories
   │
   ├──────────────► PostgreSQL
   │
   └──────────────► Redis
```

### Layer Responsibilities

#### Routes

Routes define API endpoints and connect incoming requests to the appropriate controllers.

#### Controllers

Controllers handle HTTP requests and responses. They validate request flow and delegate business logic to services.

#### Services

Services contain the core application logic, including authentication, chat operations, message handling, and session management.

#### Repositories

Repositories handle direct database access and keep SQL operations separated from application logic.

---

## 📁 Project Structure

```text
ShadowDock/
│
├── client/                     # React + Vite frontend
│
├── server/                     # Node.js backend
│   │
│   ├── controllers/            # Request controllers
│   ├── middleware/             # Authentication, validation, rate limiting
│   ├── repositories/           # Database access layer
│   ├── routes/                 # API routes
│   ├── services/               # Business logic
│   ├── socket/                 # Socket.IO configuration and events
│   ├── utils/                  # Utility functions
│   │
│   └── index.js                # Server entry point
│
├── docker/                     # Docker configuration
│
├── docs/                       # Project documentation
│
├── tests/                      # Automated tests
│
├── docker-compose.yml          # Base Docker configuration
├── docker-compose.dev.yml      # Development configuration
├── docker-compose.prod.yml     # Production configuration
│
├── .dockerignore
├── .gitignore
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
└── SECURITY.md
```

---

## 🔐 Authentication Architecture

ShadowDock uses JWT-based authentication with access tokens and refresh tokens.

```text
User
 │
 ▼
Login Request
 │
 ▼
Authentication Service
 │
 ├── Verify Credentials
 │
 ├── Generate Access Token
 │
 └── Generate Refresh Token
          │
          ▼
      Active Session
          │
          ▼
Authenticated Requests
```

### Access Token

The access token is used to authenticate API requests and protected operations.

### Refresh Token

The refresh token is used to maintain authenticated sessions without requiring the user to log in repeatedly.

Refresh tokens can be rotated to improve session security and support session management.

---

## 💬 Real-Time Messaging

ShadowDock uses Socket.IO to support real-time communication between connected users.

```text
User A
   │
   │ Message Event
   ▼
Socket.IO Server
   │
   ├── Validate User
   │
   ├── Process Message
   │
   ├── Store Message
   │
   ▼
PostgreSQL
   │
   ▼
Socket Event
   │
   ▼
User B
```

Messages are persisted before or alongside real-time delivery so that conversations remain available after page reloads or reconnections.

---

## 🗄️ Data Layer

### PostgreSQL

PostgreSQL is used as the primary persistent database for application data.

Core data includes:

- Users
- Chats
- Chat members
- Messages
- Attachments
- Authentication sessions and related data

### Redis

Redis is available for services that benefit from fast in-memory storage and caching.

Potential responsibilities include:

- Caching
- Temporary session-related data
- Rate limiting support
- Socket-related coordination
- Future scalability features

---

## 🐳 Docker Architecture

ShadowDock uses Docker Compose to create a consistent development environment.

The development stack includes:

```text
┌──────────────┐
│    Client    │
│ React + Vite │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Server    │
│ Node + API   │
└──────┬───────┘
       │
       ├──────────────► PostgreSQL
       │
       └──────────────► Redis
```

Docker allows the application services to run together without manually configuring every dependency on the host system.

The project supports separate Docker Compose configurations for:

- Base configuration
- Development
- Production

---

## 🚀 Development Environment

The project is designed to run using Docker Compose.

Typical development services include:

- Client
- Server
- PostgreSQL
- Redis

The development configuration supports hot reloading so that frontend and backend changes can be reflected without rebuilding the entire environment manually.
---

## ⚙️ Prerequisites

Before running ShadowDock, make sure the following tools are installed:

- Docker
- Docker Compose
- Git

For local development without Docker, you may also need:

- Node.js
- npm
- PostgreSQL
- Redis

Verify Docker installation:

```bash
docker --version
docker compose version
```

---

## 📥 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
```

Navigate into the project directory:

```bash
cd ShadowDock
```

---

### 2. Configure Environment Variables

The backend uses environment variables for application configuration.

Create or configure the server environment file:

```text
server/.env
```

A development configuration may include:

```env
NODE_ENV=development

SERVER_HOST=localhost
PORT=5000

CLIENT_URL=http://localhost:5173

DB_HOST=postgres
DB_PORT=5432
DB_NAME=shadowdock
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false

DB_POOL_MIN=2
DB_POOL_MAX=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=5000
```

Authentication-related secrets and other sensitive configuration values should not be committed to version control.

---

## 🐳 Running with Docker Compose

Start the development environment with:

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  up --build
```

To run the containers in detached mode:

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  up --build -d
```

This starts the services defined by the Docker Compose configuration.

Depending on the current configuration, the stack includes services such as:

- Client
- Server
- PostgreSQL
- Redis

---

## 🛑 Stopping the Development Environment

To stop and remove the development containers:

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  down
```

This safely shuts down the development stack.

If volumes should also be removed:

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  down -v
```

> ⚠️ Removing volumes can delete persistent development database data.

---

## 📜 Viewing Logs

View logs from all running services:

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  logs
```

Follow logs in real time:

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  logs -f
```

View logs for a specific service:

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  logs -f server
```

The service name may vary depending on the Docker Compose configuration.

---

## 🌐 Application Access

During development, the frontend and backend typically run on separate ports.

### Client

```text
http://localhost:5173
```

### Server

```text
http://localhost:5000
```

### API Base Path

```text
http://localhost:5000/api/v1
```

The exact available endpoints depend on the currently implemented API routes.

---

## 🔌 API Architecture

The API is organized under a versioned base path:

```text
/api/v1
```

This allows future API versions to be introduced without immediately breaking older clients.

Example structure:

```text
/api
└── v1
    ├── auth
    ├── users
    ├── chats
    └── messages
```

---

## 🔐 Authentication Endpoints

Authentication functionality includes routes for operations such as:

```text
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/logout-all
GET    /api/v1/auth/me
```

### Authentication Flow

```text
Register / Login
       │
       ▼
Verify User Credentials
       │
       ▼
Generate Access Token
       │
       ▼
Generate Refresh Token
       │
       ▼
Authenticated Session
```

Protected routes require valid authentication credentials.

---

## 🧩 Socket.IO Architecture

The Socket.IO server is responsible for real-time communication.

The general connection flow is:

```text
Client
   │
   ▼
Socket Connection
   │
   ▼
Socket Authentication
   │
   ▼
Authenticated Socket
   │
   ▼
Chat Events
   │
   ├── Join Conversation
   ├── Send Message
   ├── Receive Message
   └── Future Real-Time Events
```

Socket authentication helps ensure that only authenticated users can perform protected real-time operations.

---

## 💬 Message Flow

A simplified message flow looks like:

```text
User
 │
 ▼
Message Input
 │
 ▼
Client Application
 │
 ▼
Socket Event
 │
 ▼
Socket Server
 │
 ▼
Message Service
 │
 ▼
Message Repository
 │
 ▼
PostgreSQL
 │
 ▼
Persisted Message
 │
 ▼
Real-Time Delivery
 │
 ▼
Conversation Participants
```

This architecture separates:

- Client-side interaction
- Real-time transport
- Business logic
- Database operations

---

## 🗂️ Backend Module Structure

The backend is organized into modular components.

```text
server/
│
├── controllers/
│   ├── auth.controller.js
│   ├── chat.controller.js
│   └── ...
│
├── middleware/
│   ├── authentication
│   ├── validation
│   ├── error handling
│   └── rate limiting
│
├── repositories/
│   ├── user.repository.js
│   ├── chat.repository.js
│   ├── message.repository.js
│   └── ...
│
├── routes/
│   └── v1/
│       ├── auth.routes.js
│       ├── chat.routes.js
│       └── ...
│
├── services/
│   ├── auth.service.js
│   ├── chat.service.js
│   ├── user.service.js
│   └── ...
│
├── socket/
│   ├── auth.js
│   ├── index.js
│   └── events/
│       ├── chat.events.js
│       ├── message.events.js
│       └── ...
│
├── utils/
│
└── index.js
```

This structure is intended to make the application easier to maintain and extend as additional features are introduced.

---

## 🗃️ Database Entities

The PostgreSQL database currently supports application entities related to messaging and user communication.

Core entities include:

```text
Users
Chats
Chat Members
Messages
Attachments
```

Their relationships can be represented conceptually as:

```text
User
 │
 ├──────────────┐
 ▼              ▼
Chat Member    Messages
 │
 ▼
Chat
 │
 ├──────────────► Chat Members
 │
 └──────────────► Messages
```

A chat can contain multiple members, while messages belong to conversations and are persisted for retrieval after reconnecting or reloading the application.

---

## 🧪 Testing

The project includes a dedicated testing structure:

```text
tests/
```

Tests can be expanded to cover:

- Authentication flows
- API endpoints
- Service logic
- Repository operations
- Socket.IO events
- Message delivery
- Authorization
- Error handling

Future testing goals include automated integration and end-to-end testing.

---

## 🛡️ Security

Security-related measures and architecture include:

- Password hashing
- JWT-based authentication
- Refresh token handling
- Session management
- User authorization
- Protected API routes
- Socket authentication
- Input validation
- Rate limiting
- Separation of sensitive environment variables from source code

Additional security information can be found in:

```text
SECURITY.md
```

---

## 🔮 Planned Features

ShadowDock is being designed as an extensible messaging platform.

Potential future features include:

- 🔒 End-to-end encryption
- 📱 Multi-device synchronization
- 📎 File and media sharing improvements
- 🔔 Real-time notifications
- 🎙️ Voice communication
- 📹 Video communication
- 👥 Group conversations
- ✍️ Typing indicators
- 🟢 User presence and online status
- 🔍 Message search
- 🗑️ Message deletion
- ✏️ Message editing
- ⏳ Ephemeral messages
- 📌 Pinned messages
- 🛡️ Improved security and privacy controls
- 📈 Improved monitoring and observability
- 🚀 Production deployment improvements
---

## 🧭 Project Status

ShadowDock is currently under active development.

The core architecture includes:

- React + Vite frontend
- Node.js + Express backend
- PostgreSQL database
- Redis service
- JWT authentication
- Refresh-token based sessions
- REST API architecture
- Socket.IO integration
- Chat and conversation functionality
- Persistent message storage
- Docker-based development environment

Some features are still being actively developed, refined, and tested.

---

## 🗺️ Development Roadmap

### Phase 1 — Foundation

- [x] Project initialization
- [x] Docker development environment
- [x] PostgreSQL integration
- [x] Redis integration
- [x] React frontend setup
- [x] Node.js backend setup
- [x] Express API foundation

### Phase 2 — Authentication

- [x] User registration
- [x] User login
- [x] Password hashing
- [x] JWT access tokens
- [x] Refresh token support
- [x] Session management
- [x] Protected routes
- [x] Logout functionality

### Phase 3 — Messaging

- [x] Chat data structure
- [x] Chat membership
- [x] Message persistence
- [x] Message repositories
- [x] Chat services
- [x] Socket.IO infrastructure
- [x] Real-time message events
- [ ] Continued message synchronization improvements
- [ ] Message editing
- [ ] Message deletion

### Phase 4 — Real-Time Features

- [ ] Typing indicators
- [ ] Online presence
- [ ] Read receipts
- [ ] Notifications
- [ ] Improved reconnection handling
- [ ] Multi-device synchronization

### Phase 5 — Advanced Features

- [ ] Group chats
- [ ] File sharing
- [ ] Media sharing
- [ ] Message search
- [ ] Pinned messages
- [ ] Ephemeral messages
- [ ] Voice communication
- [ ] Video communication

### Phase 6 — Security and Production

- [ ] End-to-end encryption research and architecture
- [ ] Security hardening
- [ ] Expanded automated testing
- [ ] Monitoring and observability
- [ ] Production deployment configuration
- [ ] CI/CD pipeline
- [ ] Performance optimization

---

## 🤝 Contributing

Contributions, suggestions, bug reports, and improvements are welcome.

Before contributing, review:

```text
CONTRIBUTING.md
```

A typical contribution workflow is:

```bash
# Clone the repository
git clone <your-repository-url>

# Navigate into the project
cd ShadowDock

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes

# Check repository status
git status

# Stage changes
git add .

# Create a commit
git commit -m "feat: describe your change"

# Push the branch
git push origin feature/your-feature-name
```

---

## 🐛 Bug Reports

If you encounter a bug, please include as much useful information as possible.

A good bug report should include:

- A clear description of the issue
- Steps to reproduce the problem
- Expected behavior
- Actual behavior
- Relevant screenshots
- Relevant logs or error messages
- Environment information when applicable

For security-related issues, refer to:

```text
SECURITY.md
```

---

## 📄 Documentation

Project documentation can be found in:

```text
docs/
```

Additional repository documents include:

| File | Purpose |
|---|---|
| `README.md` | Project overview and setup instructions |
| `CHANGELOG.md` | Project changes and release history |
| `CONTRIBUTING.md` | Contribution guidelines |
| `SECURITY.md` | Security policy and reporting information |
| `LICENSE` | Project license |

---

## 🧰 Useful Docker Commands

### Start development services

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  up --build
```

### Start services in detached mode

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  up --build -d
```

### Stop services

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  down
```

### View running containers

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  ps
```

### View logs

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  logs
```

### Follow logs

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  logs -f
```

### Rebuild services

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  up --build
```

---

## 🧑‍💻 Development Philosophy

ShadowDock is being developed with an emphasis on:

- Clear separation of responsibilities
- Modular architecture
- Maintainable code
- Real-time communication
- Persistent data
- Authentication and authorization
- Docker-based reproducibility
- Future extensibility
- Security-conscious design

The goal is to build the project incrementally while maintaining a clean architecture that can support more advanced messaging capabilities over time.

---

## 🔮 Vision

ShadowDock aims to evolve beyond a basic messaging application into a more advanced, privacy-focused communication platform.

The long-term vision includes exploring:

```text
Real-Time Messaging
        │
        ▼
Secure Communication
        │
        ▼
Multi-Device Synchronization
        │
        ├───────────────┐
        ▼               ▼
   Voice Calls      Video Calls
        │               │
        └───────┬───────┘
                ▼
       Advanced Privacy
                │
                ▼
       Scalable Architecture
```

Future development will focus on improving reliability, synchronization, security, user experience, and scalability.

---

## 📊 Current Stack Overview

```text
Frontend
└── React + Vite
        │
        │ HTTP / REST
        │ Socket.IO
        ▼
Backend
└── Node.js + Express
        │
        ├── Authentication
        ├── API
        ├── Services
        ├── Socket.IO
        │
        ▼
Data Services
├── PostgreSQL
└── Redis
        │
        ▼
Infrastructure
└── Docker Compose
```

---

## 📜 License

This project is distributed under the terms specified in the repository's:

```text
LICENSE
```

---

## 👤 Author

**ShadowDock** is an independently developed full-stack real-time messaging project.

Built as a hands-on engineering project to explore and develop practical experience with:

- Full-stack web development
- React
- Node.js
- Express
- PostgreSQL
- Redis
- Docker
- REST APIs
- Socket.IO
- Authentication
- Real-time systems
- Scalable application architecture

---

## ⭐ Support

If you find ShadowDock interesting or useful, consider supporting the project by:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting improvements
- 🤝 Contributing to the project
- 📢 Sharing feedback

---

<div align="center">

### ShadowDock

**Real-time communication. Modular architecture. Built to evolve.**

</div>