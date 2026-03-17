# Proxima — Real-Time Collaborative Classroom

WebRTC-powered remote learning platform with live engagement detection, real-time annotation, and multi-session support.

## Stack

- **Media Server** — Livekit SFU (Docker)
- **Backend** — Node.js, Express, Socket.io
- **Frontend** — React 18, Vite
- **AI** — face-api.js (runs entirely in browser)
- **Database** — SQLite (better-sqlite3)
- **Authentication** — JWT (Access + Refresh tokens)

## Running Locally

### 1. Start Livekit

```bash
docker-compose up -d livekit
```

### 2. Start Backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### 3. Start Frontend

```bash
cd client
npm install
npm run dev
```

**Frontend** — http://localhost:5173  
**Backend**  — http://localhost:3001  
**Livekit**  — ws://localhost:7880

## Authentication API

### Register User

```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "role": "teacher"  // or "student"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "teacher"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "teacher"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Refresh Access Token

```bash
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Get Current User

```bash
GET /auth/me
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "teacher"
  }
}
```

### Logout

```bash
POST /auth/logout
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: 
  - Access token: 15 minutes expiry
  - Refresh token: 7 days expiry
- **Rate Limiting**: 
  - Auth endpoints: 10 requests/15min (production)
  - Token endpoints: 30 requests/15min (production)
  - General API: 100 requests/15min (production)
- **Input Validation**: Email format, password complexity, name length
- **CORS**: Configured for frontend origin only

## Environment Variables

### Server (.env)

```bash
# Server
PORT=3001
CLIENT_URL=http://localhost:5173

# Livekit
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
LIVEKIT_HOST=ws://localhost:7880

# JWT Secrets (generate secure random strings for production)
JWT_ACCESS_SECRET=<min-32-char-secret>
JWT_REFRESH_SECRET=<min-32-char-secret>
```

Generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Repo Structure

```
proxima/
├── server/               # Node.js backend
│   ├── src/
│   │   ├── routes/       # auth.js, token.js, rooms.js
│   │   ├── middleware/   # auth.js, rateLimiter.js
│   │   ├── database/     # SQLite connection & schema
│   │   ├── socket/       # all socket.io event handlers
│   │   └── store/        # in-memory room state
│   ├── data/             # SQLite database (auto-created)
│   └── server.js         # entry point
├── client/               # React frontend
│   ├── src/
│   │   ├── pages/        # LandingPage, TeacherRoom, StudentRoom
│   │   └── components/   # all reusable components
│   └── public/
│       └── models/       # face-api.js model weight files
├── docker-compose.yml
├── livekit.yaml
└── README.md
```

## Testing Authentication

Run the test suite:

```bash
cd server
NODE_ENV=development node test-auth.js
```

This tests:
- User registration
- Duplicate email rejection
- Login with valid/invalid credentials
- Protected routes
- Token refresh
- Password validation
- Logout

## Production Deployment

1. **Generate secure JWT secrets** and update `.env`
2. **Set `NODE_ENV=production`** for stricter rate limiting
3. **Use HTTPS** for all API endpoints
4. **Configure reverse proxy** (nginx/Apache) for SSL termination
5. **Enable database backups** for SQLite file
