# 🎫 Support Ticket Management System API

**Version:** 1.0.0 &nbsp;|&nbsp; **Architecture:** REST API &nbsp;|&nbsp; **Database:** MongoDB

A production-grade backend API for managing support tickets with Role-Based Access Control (RBAC), built with Node.js, Express, and MongoDB.

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure token-based auth
- 👥 **Role-Based Access Control** — MANAGER, SUPPORT, USER roles
- 🎫 **Full Ticket Lifecycle** — Create, assign, update status, delete
- 💬 **Comments System** — Threaded comments per ticket
- 📊 **Status Transition Audit Log** — Every status change is recorded
- ✅ **Input Validation** — All endpoints validated via express-validator
- 📚 **Swagger UI Docs** — Interactive API docs at `/docs`
- 🏗️ **Clean MVC Architecture** — Separation of concerns

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (Atlas or Local) |
| ODM | Mongoose |
| Auth | JWT (jsonwebtoken) |
| Password Hashing | bcrypt |
| Validation | express-validator |
| API Docs | swagger-ui-express + swagger-jsdoc |
| Dev Server | nodemon |

---

## 📁 Project Structure

```
.
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Login logic
│   ├── userController.js    # User CRUD
│   ├── ticketController.js  # Ticket CRUD
│   └── commentController.js # Comment CRUD
├── middlewares/
│   ├── authMiddleware.js    # JWT verification
│   ├── roleMiddleware.js    # Role-based access
│   ├── validationMiddleware.js # Input validation handler
│   └── errorHandler.js     # Global error handler
├── models/
│   ├── Role.js
│   ├── User.js
│   ├── Ticket.js
│   ├── TicketComment.js
│   ├── TicketStatusLog.js
│   └── index.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── ticketRoutes.js
│   └── commentRoutes.js
├── services/
│   ├── ticketService.js     # Ticket business logic
│   └── commentService.js   # Comment business logic
├── utils/
│   └── statusTransition.js # Valid status transition rules
├── scripts/
│   └── initDatabase.js     # DB seed script
├── server.js               # App entry point
├── package.json
└── .env                    # Environment variables
```

---

## ⚙️ Prerequisites

- **Node.js** v14 or higher
- **MongoDB** — Local (v4.4+) or [MongoDB Atlas](https://www.mongodb.com/atlas)
- **npm**

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB — use Atlas URI or local
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/support_tickets?retryWrites=true&w=majority

# Local MongoDB alternative (used if MONGODB_URI is not set)
DB_HOST=localhost
DB_PORT=27017
DB_NAME=support_tickets

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1d
```

### 3. Seed the Database

Run the initialization script to create roles and a default MANAGER account:

```bash
node scripts/initDatabase.js
```

This creates:
- Roles: `MANAGER`, `SUPPORT`, `USER`
- Default Manager:
  - **Email:** `manager@example.com`
  - **Password:** `Manager123!`

### 4. Start the Server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:3000`  
Swagger Docs at: `http://localhost:3000/docs`

---

## 🔑 Authentication

All protected endpoints require a `Bearer` token in the `Authorization` header.

**Login to get a token:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@example.com",
    "password": "Manager123!"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "699d1be58794cc3be2079a0b",
      "name": "Default Manager",
      "role": "MANAGER"
    }
  }
}
```

Use the token in all subsequent requests:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📡 API Endpoints

### 🔓 Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/login` | Public | Login and get JWT token |

---

### 👤 Users

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/users` | MANAGER | Create a new user (USER or SUPPORT) |
| GET | `/users` | MANAGER | List all users |

**Create User Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "SUPPORT"
}
```

---

### 🎫 Tickets

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/tickets` | USER, MANAGER | Create a new ticket |
| GET | `/tickets` | All (filtered by role) | Get tickets |
| GET | `/tickets/:id` | All (with access control) | Get ticket by ID |
| PATCH | `/tickets/:id/assign` | MANAGER, SUPPORT | Assign ticket to a user |
| PATCH | `/tickets/:id/status` | MANAGER, SUPPORT | Update ticket status |
| DELETE | `/tickets/:id` | MANAGER | Delete a ticket |

**Create Ticket Request:**
```json
{
  "title": "System not responding",
  "description": "The system is not responding to my requests",
  "priority": "HIGH"
}
```

**Assign Ticket Request:**
```json
{
  "assigned_to": "65a3f4b2c9e77a001f3d8abc"
}
```
> `assigned_to` must be a valid MongoDB ObjectId of a SUPPORT or MANAGER user.

---

### 💬 Comments

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/tickets/:id/comments` | All (access-controlled) | Add comment to ticket |
| GET | `/tickets/:id/comments` | All (access-controlled) | Get comments for ticket |
| PATCH | `/comments/:id` | MANAGER, comment author | Edit a comment |
| DELETE | `/comments/:id` | MANAGER, comment author | Delete a comment |

**Create Comment Request:**
```json
{
  "comment": "We are looking into this issue."
}
```

---

## 👥 Role-Based Access Control

| Permission | MANAGER | SUPPORT | USER |
|---|:---:|:---:|:---:|
| Login | ✅ | ✅ | ✅ |
| Create users | ✅ | ❌ | ❌ |
| View all tickets | ✅ | ❌ | ❌ |
| View assigned tickets | ✅ | ✅ | ❌ |
| View own tickets | ✅ | ✅ | ✅ |
| Create tickets | ✅ | ❌ | ✅ |
| Assign tickets | ✅ | ✅ | ❌ |
| Update status | ✅ | ✅ | ❌ |
| Delete tickets | ✅ | ❌ | ❌ |
| Comment on any ticket | ✅ | ❌ | ❌ |
| Comment on assigned ticket | ✅ | ✅ | ❌ |
| Comment on own ticket | ✅ | ✅ | ✅ |
| Edit/Delete any comment | ✅ | ❌ | ❌ |
| Edit/Delete own comment | ✅ | ✅ | ✅ |

---

## 🔄 Ticket Status Flow

Tickets follow a **strict, one-way** status progression:

```
OPEN  ──▶  IN_PROGRESS  ──▶  RESOLVED  ──▶  CLOSED
```

| Transition | Allowed |
|---|:---:|
| OPEN → IN_PROGRESS | ✅ |
| IN_PROGRESS → RESOLVED | ✅ |
| RESOLVED → CLOSED | ✅ |
| Any backward transition | ❌ |
| Skipping a step (e.g. OPEN → RESOLVED) | ❌ |

Every status change is automatically recorded in the `TicketStatusLog` collection.

---

## 🧪 Full Testing Walkthrough

### Step 1 — Login as Manager
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "manager@example.com", "password": "Manager123!"}'
```
Save the token as `MANAGER_TOKEN`.

### Step 2 — Create a Support Agent
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -d '{"name": "Support Agent", "email": "support@example.com", "password": "password123", "role": "SUPPORT"}'
```

### Step 3 — Create a User
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -d '{"name": "Test User", "email": "user@example.com", "password": "password123", "role": "USER"}'
```

### Step 4 — Login as User & Create a Ticket
```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Create ticket (use USER_TOKEN from above login)
curl -X POST http://localhost:3000/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{"title": "System not responding", "description": "The system is not responding to my requests", "priority": "HIGH"}'
```

### Step 5 — Assign Ticket (as Manager)
```bash
# Replace <TICKET_ID> and <SUPPORT_USER_ID> with actual MongoDB ObjectIds
curl -X PATCH http://localhost:3000/tickets/<TICKET_ID>/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MANAGER_TOKEN" \
  -d '{"assigned_to": "<SUPPORT_USER_ID>"}'
```

### Step 6 — Update Status (as Support)
```bash
curl -X PATCH http://localhost:3000/tickets/<TICKET_ID>/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPPORT_TOKEN" \
  -d '{"status": "IN_PROGRESS"}'
```

---

## ❌ Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    { "field": "email", "message": "Valid email is required" }
  ]
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Resource created |
| `204` | No content (successful delete) |
| `400` | Bad request / Validation error |
| `401` | Unauthorized (missing or invalid token) |
| `403` | Forbidden (insufficient role permissions) |
| `404` | Resource not found |
| `500` | Internal server error |

---

## 🗄️ Database Schema

### `roles`
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `name` | String | ENUM: MANAGER, SUPPORT, USER — unique |

### `users`
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `name` | String | Required |
| `email` | String | Required, unique |
| `password` | String | bcrypt hash |
| `role_id` | ObjectId | Ref: Role |
| `created_at` | Date | Auto |

### `tickets`
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `title` | String | 5–255 chars |
| `description` | String | Min 10 chars |
| `status` | String | ENUM: OPEN, IN_PROGRESS, RESOLVED, CLOSED |
| `priority` | String | ENUM: LOW, MEDIUM, HIGH (default: MEDIUM) |
| `created_by` | ObjectId | Ref: User |
| `assigned_to` | ObjectId | Ref: User, nullable |
| `created_at` | Date | Auto |

### `ticketcomments`
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `ticket_id` | ObjectId | Ref: Ticket, indexed |
| `user_id` | ObjectId | Ref: User |
| `comment` | String | Required |
| `created_at` | Date | Auto |

### `ticketstatuslogs`
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `ticket_id` | ObjectId | Ref: Ticket, indexed |
| `old_status` | String | Nullable (null for first entry) |
| `new_status` | String | Required |
| `changed_by` | ObjectId | Ref: User |
| `changed_at` | Date | Auto |

---

## 🔒 Security

- Passwords hashed with **bcrypt** (10 salt rounds)
- JWT tokens expire after **1 day**
- All routes protected with **Bearer token** auth
- **Role-based access control** on every endpoint
- Input validated and sanitized via **express-validator**
- NoSQL injection protection via **Mongoose ODM**

---

## 🚢 Production Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use a strong, random `JWT_SECRET` (32+ chars)
- [ ] Use MongoDB Atlas with IP whitelist
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Use a process manager (e.g. **PM2**)
- [ ] Set up proper logging (e.g. **Winston**)
- [ ] Configure CORS for your frontend domain

---

## 📜 License

ISC