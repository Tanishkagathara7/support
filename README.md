# Support Ticket Management System API

**Version:** 1.0.0  
**Architecture:** REST API  
**Database:** MongoDB

A production-grade backend API for managing support tickets with Role-Based Access Control (RBAC).

## Features

- 🔐 JWT Authentication
- 👥 Role-Based Access Control (MANAGER, SUPPORT, USER)
- 🎫 Complete Ticket Management
- 💬 Ticket Comments System
- 📊 Status Transition Tracking
- 📝 Input Validation
- 📚 Swagger API Documentation
- 🏗️ Clean MVC Architecture

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Validation:** express-validator
- **Documentation:** Swagger UI

## Project Structure

```
.
├── config/           # Database and app configuration
├── controllers/      # Request handlers
├── middlewares/     # Auth, role, validation, error handlers
├── models/          # Mongoose models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
├── scripts/         # Database initialization scripts
├── server.js        # Application entry point
└── package.json     # Dependencies
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
# Option 1: Full connection string (recommended)
MONGODB_URI=mongodb://localhost:27017/support_tickets

# Option 2: Individual components (if MONGODB_URI not provided)
DB_HOST=localhost
DB_PORT=27017
DB_NAME=support_tickets

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1d
```

### 3. Database Setup

#### Option A: Automatic Setup (Recommended for Development)

```bash
node scripts/initDatabase.js
```

This script will:
- Connect to MongoDB
- Create default roles (MANAGER, SUPPORT, USER)
- Create a default manager account:
  - Email: `manager@example.com`
  - Password: `Manager123!`


### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev


The server will start on `http://localhost:3000` (or your configured PORT).

## API Documentation

Once the server is running, access Swagger UI at:
```
http://localhost:3000/docs
```

## API Endpoints

### Authentication

#### POST /auth/login
Public route for user login.

**Request:**
```json
{
  "email": "manager@example.com",
  "password": "Manager123!"
}

**Response:**
```{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "name": "Default Manager",
      "role": "MANAGER"
    }
  }
}
```

### Users (MANAGER Only)

#### POST /users
Create a new user (USER or SUPPORT role only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "SUPPORT"
}
```

#### GET /users
Get all users.

**Headers:**
```
Authorization: Bearer <token>
```

### Tickets

#### POST /tickets
Create a new ticket (USER, MANAGER).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "Login issue",
  "description": "Cannot login to the system",
  "priority": "HIGH"
}
```

**Validation:**
- Title: minimum 5 characters
- Description: minimum 10 characters
- Priority: LOW, MEDIUM, HIGH (default: MEDIUM)

#### GET /tickets
Get tickets based on role:
- **MANAGER:** All tickets
- **SUPPORT:** Assigned tickets only
- **USER:** Own tickets only

#### GET /tickets/:id
Get ticket by ID (with access control).

#### PATCH /tickets/:id/assign
Assign ticket to a user (MANAGER, SUPPORT).

**Request:**
```json
{
  "assigned_to": 2
}
```

**Rules:**
- Cannot assign to USER role
- Only SUPPORT or MANAGER can be assigned

#### PATCH /tickets/:id/status
Update ticket status (MANAGER, SUPPORT).

**Request:**
```json
{
  "status": "IN_PROGRESS"
}
```

**Valid Status Transitions:**
- OPEN → IN_PROGRESS
- IN_PROGRESS → RESOLVED
- RESOLVED → CLOSED

Invalid transitions return 400 error.

#### DELETE /tickets/:id
Delete ticket (MANAGER only).

### Comments

#### POST /tickets/:id/comments
Create a comment on a ticket.

**Access:**
- MANAGER: All tickets
- SUPPORT: Assigned tickets only
- USER: Own tickets only

**Request:**
```json
{
  "comment": "Looking into this issue"
}
```

#### GET /tickets/:id/comments
Get all comments for a ticket (same access rules as above).

#### PATCH /comments/:id
Update a comment.

**Access:**
- MANAGER: All comments
- Comment author: Own comments only

#### DELETE /comments/:id
Delete a comment.

**Access:**
- MANAGER: All comments
- Comment author: Own comments only

## Role-Based Access Control

### Roles

1. **MANAGER**
   - Full access to all tickets
   - Can create users (USER, SUPPORT)
   - Can assign tickets
   - Can update ticket status
   - Can delete tickets
   - Can manage all comments

2. **SUPPORT**
   - View assigned tickets only
   - Can assign tickets
   - Can update ticket status
   - Can comment on assigned tickets
   - Can manage own comments

3. **USER**
   - View own tickets only
   - Can create tickets
   - Can comment on own tickets
   - Can manage own comments

## Status Flow

Tickets follow a strict status flow:

```
OPEN → IN_PROGRESS → RESOLVED → CLOSED
```

**Invalid transitions:**
- OPEN → RESOLVED ❌
- IN_PROGRESS → CLOSED ❌
- Any backward transition ❌

All status changes are logged in `ticket_status_logs` table.

## Testing the API

### 1. Login as Manager

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@example.com",
    "password": "Manager123!"
  }'
```

Save the token from the response.

### 2. Create a User

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test User",
    "email": "user@example.com",
    "password": "password123",
    "role": "USER"
  }'
```

### 3. Create a Ticket (as USER)

Login as the created user, then:

```bash
curl -X POST http://localhost:3000/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "title": "System not responding",
    "description": "The system is not responding to my requests",
    "priority": "HIGH"
  }'
```

### 4. Assign Ticket (as MANAGER or SUPPORT)

```bash
curl -X PATCH http://localhost:3000/tickets/1/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -d '{
    "assigned_to": 2
  }'
```

### 5. Update Status

```bash
curl -X PATCH http://localhost:3000/tickets/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MANAGER_TOKEN" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional: validation errors
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content (successful delete)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- Passwords are hashed using bcrypt (10 rounds)
- JWT tokens expire after 1 day
- All protected routes require Bearer token
- Role-based access control on all endpoints
- Input validation on all requests
- NoSQL injection protection via Mongoose ODM

## Database Schema (MongoDB Collections)

### Roles Collection
- _id (ObjectId, PK)
- name (String, ENUM: MANAGER, SUPPORT, USER, unique)

### Users Collection
- _id (ObjectId, PK)
- name (String)
- email (String, unique, indexed)
- password (String, bcrypt hash)
- role_id (ObjectId, ref: Role)
- created_at (Date)

### Tickets Collection
- _id (ObjectId, PK)
- title (String, min: 5, max: 255)
- description (String, min: 10)
- status (String, ENUM: OPEN, IN_PROGRESS, RESOLVED, CLOSED, default: OPEN)
- priority (String, ENUM: LOW, MEDIUM, HIGH, default: MEDIUM)
- created_by (ObjectId, ref: User)
- assigned_to (ObjectId, ref: User, nullable)
- created_at (Date)

### Ticket Comments Collection
- _id (ObjectId, PK)
- ticket_id (ObjectId, ref: Ticket, indexed)
- user_id (ObjectId, ref: User)
- comment (String)
- created_at (Date)

### Ticket Status Logs Collection
- _id (ObjectId, PK)
- ticket_id (ObjectId, ref: Ticket, indexed)
- old_status (String, ENUM, nullable)
- new_status (String, ENUM)
- changed_by (ObjectId, ref: User)
- changed_at (Date)

## Development

### Running in Development Mode

```bash
npm run dev
```

Uses `nodemon` for auto-reload on file changes.

### Database Migrations

MongoDB doesn't require migrations like SQL databases. Collections and indexes are created automatically when models are first used. For production, ensure proper indexing is in place (already configured in models).

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Configure proper database credentials
4. Use environment variables for all sensitive data
5. Enable HTTPS
6. Set up proper logging
7. Use process manager (PM2, etc.)

## License

ISC

## Support

For issues or questions, please refer to the API documentation at `/docs` endpoint.

#   s u p p o r t 
 
 