# 🎨 SketchSync

<p align="center">
  <strong>Real-time collaborative whiteboard built for software engineering teams.</strong>
</p>

<p align="center">
  Design systems. Collaborate in real time. Build together.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk" />
  <img src="https://img.shields.io/badge/Spring%20Boot-4-brightgreen?style=for-the-badge&logo=springboot" />
  <img src="https://img.shields.io/badge/WebSocket-Realtime-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Redis-Pub%2FSub-red?style=for-the-badge&logo=redis" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql" />
  <img src="https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker" />
</p>

---

## 📌 About

**SketchSync** is a real-time collaborative whiteboard designed specifically for software engineering teams.

Instead of treating collaboration as a simple canvas-sharing problem, SketchSync is built around a distributed architecture that separates:

- Persistent application state
- High-frequency real-time collaboration
- Room membership and authorization
- Canvas snapshot persistence
- Cross-instance WebSocket communication

The platform allows engineering teams to visually design architectures, brainstorm ideas, and collaborate on diagrams in real time.

---

# ✨ Features

### 🖌️ Collaborative Whiteboard

- Interactive canvas
- Real-time drawing
- Cursor synchronization
- Shape previews
- Erasing
- Canvas clearing
- Room-based collaboration

### ⚡ Real-Time Collaboration

Built using native WebSockets for low-latency communication.

Supported events include:

```text
join_room
leave_room
draw
cursor
preview
erase
clear_preview
save
```

### 👥 Collaborative Rooms

Users can:

- Create rooms
- Join rooms
- Verify room membership
- Collaborate with room members
- Restore the latest canvas state

### 🔐 JWT Authentication

Authentication is implemented using JWT.

The system supports:

- User signup
- User signin
- JWT validation
- HTTP-only authentication cookies
- Bearer token authentication for internal service communication
- WebSocket handshake authentication

### 💾 Persistent Canvas Snapshots

Canvas state is periodically persisted instead of writing every drawing event directly to PostgreSQL.

```text
Drawing Events
      │
      ▼
Snapshot Manager
      │
      │ Debounced
      ▼
Core Service
      │
      ▼
PostgreSQL
```

This significantly reduces unnecessary database writes during continuous drawing.

### 🚀 Distributed WebSocket Architecture

Redis Pub/Sub allows multiple collaboration-service instances to communicate.

```text
                    Redis Pub/Sub
                         │
              sketchsync:room:{roomId}
                         │
             ┌───────────┴───────────┐
             │                       │
             ▼                       ▼
     Collaboration A         Collaboration B
             │                       │
         Users A/B                 Users C/D
```

This allows the collaboration layer to scale horizontally.

### ❤️ WebSocket Heartbeats

The collaboration service periodically sends WebSocket ping frames to detect unhealthy connections and clean up stale sessions.

### 👤 Presence

Users receive real-time presence events when members join or leave a room.

```json
{
  "type": "user_joined",
  "userId": "..."
}
```

---

# 🏗️ Architecture

```text
                         ┌──────────────────────┐
                         │      Next.js UI      │
                         │      Port 3000       │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                  REST                         WebSocket
                    │                               │
                    ▼                               ▼
        ┌──────────────────────┐       ┌──────────────────────┐
        │    Core Service      │       │ Collaboration        │
        │    Spring Boot       │       │ Service              │
        │    Port 8081         │       │ Port 8082            │
        │                      │       │                      │
        │ • Authentication     │       │ • WebSockets         │
        │ • Users              │       │ • Realtime Events    │
        │ • Rooms              │       │ • Presence           │
        │ • Membership         │       │ • Snapshot Manager   │
        │ • Snapshots          │       │ • Redis Pub/Sub      │
        └──────────┬───────────┘       └──────────┬───────────┘
                   │                              │
                   ▼                              ▼
        ┌──────────────────────┐       ┌──────────────────────┐
        │     PostgreSQL       │       │        Redis         │
        │                      │       │                      │
        │ • Users              │       │ • Pub/Sub            │
        │ • Rooms              │       │ • Room Channels      │
        │ • Members            │       │ • Cross-instance     │
        │ • Snapshots          │       │   Events             │
        └──────────────────────┘       └──────────────────────┘
```

---

# 🧩 Backend Services

## Core Service

**Port:** `8081`

The Core Service manages persistent application state.

### Responsibilities

- Authentication
- JWT generation and validation
- User management
- Room creation
- Room joining
- Room membership verification
- Canvas snapshot persistence
- PostgreSQL access
- REST APIs

### Technologies

- Java 21
- Spring Boot 4
- Spring Security
- Spring Data JPA
- Hibernate
- PostgreSQL
- JJWT
- Spring Boot Actuator

---

## Collaboration Service

**Port:** `8082`

The Collaboration Service handles high-frequency real-time communication.

### Responsibilities

- WebSocket connections
- JWT WebSocket authentication
- Room session management
- Real-time collaboration
- User presence
- Redis Pub/Sub
- Canvas snapshot scheduling
- Cross-instance event propagation
- WebSocket heartbeat management

### Technologies

- Java 21
- Spring Boot 4
- Spring WebSocket
- Spring Data Redis
- Redis Pub/Sub

---

# 🔄 Real-Time Collaboration Flow

When a user draws on the canvas:

```text
User
 │
 │ WebSocket
 ▼
Collaboration Service
 │
 ├──────────────► Local WebSocket Users
 │
 ▼
Redis Pub/Sub
 │
 ▼
Other Collaboration Instances
 │
 ▼
Their Local WebSocket Users
```

The database is **not involved in every drawing event**.

This keeps the real-time path lightweight and allows PostgreSQL to focus on persistent application state.

---

# 💾 Snapshot Persistence

Instead of saving every canvas operation:

```text
Draw
Draw
Draw
Draw
Draw
  │
  ▼
Latest Canvas State
  │
  ▼
Snapshot Manager
  │
  │ Debounce
  ▼
Core Service
  │
  ▼
PostgreSQL
```

When a user joins a room:

```text
Client
  │
  ▼
Collaboration Service
  │
  ▼
Core Service
  │
  ▼
PostgreSQL
  │
  ▼
Latest Snapshot
  │
  ▼
Client
```

This provides persistence without turning every mouse movement into a database transaction.

---

# 🔐 Authentication Flow

```text
                 Sign In
                    │
                    ▼
              Core Service
                    │
                    ▼
                JWT Token
                    │
                    ▼
            HTTP-only Cookie
                    │
                    ▼
              WebSocket
               Handshake
                    │
                    ▼
       JWT Handshake Interceptor
                    │
                    ▼
          Authenticated Session
```

For internal service communication:

```http
Authorization: Bearer <JWT>
```

The Collaboration Service uses the authenticated token to ask the Core Service whether a user belongs to a room.

---

# 🏠 Room Authorization

Before a WebSocket client joins a room:

```text
Client
  │
  ▼
Collaboration Service
  │
  │ GET /api/rooms/{roomId}/membership
  │ Authorization: Bearer <JWT>
  ▼
Core Service
  │
  ▼
PostgreSQL
  │
  ▼
Membership Result
```

This keeps room membership as an authoritative responsibility of the Core Service.

---

# 📊 Data Model

```text
             ┌─────────────┐
             │    User     │
             └──────┬──────┘
                    │
                    │
             ┌──────▼──────┐
             │    Room     │
             └──────┬──────┘
                    │
          ┌─────────┴─────────┐
          │                   │
   ┌──────▼──────┐     ┌──────▼──────────┐
   │ RoomMember  │     │ CanvasSnapshot  │
   └─────────────┘     └─────────────────┘
```

### Users

```text
users
├── id
├── email
├── password
├── name
├── photo
└── created_at
```

### Rooms

```text
rooms
├── id
├── slug
├── created_at
└── admin_id
```

### Room Members

```text
room_members
├── id
├── room_id
├── user_id
└── joined_at
```

A unique constraint exists on:

```text
(room_id, user_id)
```

### Canvas Snapshots

```text
canvas_snapshots
├── id
├── room_id
├── data
└── updated_at
```

Each room has a single current canvas snapshot.

---

# 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Canvas | HTML5 Canvas |
| Realtime | Native WebSocket |
| Backend | Spring Boot 4 |
| Language | Java 21 |
| Security | Spring Security + JWT |
| Database | PostgreSQL |
| ORM | Hibernate / Spring Data JPA |
| Messaging | Redis Pub/Sub |
| Containerization | Docker |
| Orchestration | Docker Compose |
| Monitoring | Spring Boot Actuator |
| Testing | JUnit + Spring Boot Test |

---

# 📂 Project Structure

```text
SketchSync/
│
├── frontend/
│   └── ...
│
├── backend/
│   │
│   ├── core-service/
│   │   ├── src/
│   │   ├── pom.xml
│   │   └── Dockerfile
│   │
│   ├── collaboration-service/
│   │   ├── src/
│   │   ├── pom.xml
│   │   └── Dockerfile
│   │
│   └── common/
│
├── docker-compose.yml
├── pom.xml
└── README.md
```

---

# 🐳 Docker

SketchSync is fully containerized for local backend development.

### Services

| Service | Port |
|---|---:|
| Frontend | `3000` |
| Core Service | `8081` |
| Collaboration Service | `8082` |
| PostgreSQL | `5432` |
| Redis | `6379` |

### Start

```bash
docker compose up --build
```

### Stop

```bash
docker compose down
```

### Remove containers and volumes

```bash
docker compose down -v
```

> PostgreSQL and Redis use Docker volumes for persistent local development data.

---

# ⚙️ Local Development

## Prerequisites

Make sure you have:

- Java 21
- Maven
- Node.js
- pnpm
- PostgreSQL
- Redis
- Docker Desktop

---

## Clone the Repository

```bash
git clone https://github.com/your-username/sketchsync.git

cd sketchsync
```

---

## Configure PostgreSQL

Create the database:

```sql
CREATE DATABASE sketchsync;
```

Configure:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/sketchsync
spring.datasource.username=postgres
spring.datasource.password=yourpassword
```

---

## Configure Redis

Run Redis locally:

```bash
redis-server
```

Or run it using Docker:

```bash
docker run -d \
  --name sketchsync-redis \
  -p 6379:6379 \
  redis:8
```

---

## Configure JWT

Set your JWT secret:

```bash
JWT_SECRET=your-long-secret-key
```

> Use a strong secret in production.

---

## Start Core Service

```bash
cd backend

mvn -pl core-service -am spring-boot:run
```

Core Service:

```text
http://localhost:8081
```

Health:

```text
http://localhost:8081/actuator/health
```

---

## Start Collaboration Service

```bash
mvn -pl collaboration-service -am spring-boot:run
```

WebSocket endpoint:

```text
ws://localhost:8082/ws
```

Health:

```text
http://localhost:8082/actuator/health
```

---

# 🔌 API Overview

## Authentication

```http
POST /api/auth/signup
POST /api/auth/signin
POST /api/auth/logout
```

## Rooms

```http
POST /api/rooms
POST /api/rooms/join
GET  /api/rooms/{roomId}
GET  /api/rooms/{roomId}/membership
```

## Canvas

```http
GET  /api/canvas/{roomId}
POST /api/canvas/{roomId}
```

---

# 🧪 Testing

The backend contains tests for important business logic including:

- JWT service
- User service
- Room service
- Canvas snapshot service

Run all tests:

```bash
mvn test
```

### End-to-End Testing

The complete flow can be tested using Postman:

```text
Signup
  ↓
Signin
  ↓
Create Room
  ↓
Join Room
  ↓
Verify Membership
  ↓
Connect WebSocket
  ↓
Join Room
  ↓
Collaborate
  ↓
Save Canvas
  ↓
Restore Canvas Snapshot
```

---

# 🚧 Technical Challenges

## Distributed WebSocket Communication

A WebSocket session exists only on the instance that accepted the connection.

For example:

```text
User A → Collaboration A
User B → Collaboration B
```

A normal in-memory broadcast from Collaboration A cannot reach User B.

Redis Pub/Sub introduces a shared communication layer:

```text
Collaboration A
      │
      ▼
    Redis
      │
      ▼
Collaboration B
```

---

## Database Write Optimization

Saving every drawing operation directly to PostgreSQL would generate unnecessary database traffic.

Instead, SketchSync maintains the latest state in memory and periodically persists a snapshot.

This separates:

```text
Realtime State
```

from:

```text
Persistent State
```

---

## WebSocket Authentication

HTTP authentication and WebSocket authentication have different lifecycles.

SketchSync validates the JWT during the WebSocket handshake and attaches the authenticated user ID to the WebSocket session.

---

## Cross-Service Authorization

The Collaboration Service does not directly query PostgreSQL for room membership.

Instead:

```text
Collaboration Service
        │
        ▼
Core Service
        │
        ▼
PostgreSQL
```

This keeps authorization logic centralized.

---

# 📈 Scalability

SketchSync is designed so the collaboration layer can be scaled horizontally.

```text
                    Load Balancer
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
   Collaboration A Collaboration B Collaboration C
          │              │              │
          └──────────────┼──────────────┘
                         │
                         ▼
                    Redis Pub/Sub
```

Because Redis acts as the shared event bus, users connected to different instances can still collaborate within the same room.

---

# 🤝 Contributing

Contributions, issues, and feature requests are welcome.

If you're interested in:

- Distributed systems
- WebSocket infrastructure
- Redis
- Spring Boot
- Real-time collaboration
- Canvas rendering
- System architecture
- Developer tooling

feel free to open an issue or submit a pull request.

# 📜 License

MIT License © 2026 SketchSync

---

<p align="center">
  <strong>Built for developers who think in systems.</strong>
</p>