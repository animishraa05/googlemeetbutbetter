# Proxima Backend Testing Guide

Complete backend API testing commands. Run these in order to verify everything works.

---

## Prerequisites Check

```bash
# Verify Docker services are running
docker-compose ps

# Check PostgreSQL logs
docker-compose logs postgres

# Check LiveKit logs
docker-compose logs livekit

# Verify ports are listening
netstat -tlnp | grep -E '5432|7880|3001'
```

---

## Start Backend Server

```bash
cd server
npm run dev
```

Backend should start on `http://localhost:3001`

---

## 1. Institution Registration

**Create a new institution with admin:**

```bash
curl -X POST http://localhost:3001/institutions/register \
  -H "Content-Type: application/json" \
  -d '{
    "institutionName": "Test University",
    "slug": "test-university",
    "adminName": "Admin User",
    "adminEmail": "admin@test.edu",
    "adminPassword": "AdminPass123"
  }'
```

**Expected Response:**
```json
{
  "institution": { "id": 1, "name": "Test University", "slug": "test-university", ... },
  "user": { "id": 1, "name": "Admin User", "email": "admin@test.edu", "role": "institution_admin" },
  "token": "eyJhbG..."
}
```

**Save the token for subsequent requests:**
```bash
ADMIN_TOKEN="eyJhbG..."
```

---

## 2. Teacher Registration

**Register a teacher:**

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Teacher",
    "email": "teacher@test.edu",
    "password": "TeacherPass123",
    "role": "teacher",
    "institutionId": 1
  }'
```

**Save the teacher token:**
```bash
TEACHER_TOKEN="eyJhbG..."
```

---

## 3. Student Registration (via Class Join)

**First, create a class (next section), then enroll a student:**

```bash
curl -X POST http://localhost:3001/enroll \
  -H "Content-Type: application/json" \
  -d '{
    "joinKey": "CLS-2026-ABCD",
    "name": "Jane Student",
    "username": "jane.student",
    "password": "StudentPass123"
  }'
```

**Save the student token:**
```bash
STUDENT_TOKEN="eyJhbG..."
```

---

## 4. Class Management

### Create a Class (Teacher only)

```bash
curl -X POST http://localhost:3001/classes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "name": "Mathematics 101",
    "subject": "Math",
    "description": "Introduction to Algebra"
  }'
```

**Expected Response:**
```json
{
  "class": {
    "id": 1,
    "name": "Mathematics 101",
    "subject": "Math",
    "joinKey": "MATH-2026-XYZ1",
    "teacherId": 2,
    "institutionId": 1
  }
}
```

**Save the join key and class ID:**
```bash
JOIN_KEY="MATH-2026-XYZ1"
CLASS_ID=1
```

### Get All Classes

```bash
# For teacher (shows classes they teach)
curl -X GET http://localhost:3001/classes \
  -H "Authorization: Bearer $TEACHER_TOKEN"

# For student (shows classes they're enrolled in)
curl -X GET http://localhost:3001/classes \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

### Get Class by ID

```bash
curl -X GET http://localhost:3001/classes/1 \
  -H "Authorization: Bearer $TEACHER_TOKEN"
```

### Verify Join Key

```bash
curl -X GET http://localhost:3001/classes/join/$JOIN_KEY
```

---

## 5. Live Session Management

### Create a Session

```bash
curl -X POST http://localhost:3001/sessions/classes/$CLASS_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "title": "Live Lecture: Quadratic Equations",
    "scheduledAt": "2026-03-20T10:00:00Z"
  }'
```

### Start a Session

```bash
curl -X POST http://localhost:3001/sessions/1/start \
  -H "Authorization: Bearer $TEACHER_TOKEN"
```

### Get All Sessions for a Class

```bash
curl -X GET http://localhost:3001/sessions/classes/$CLASS_ID \
  -H "Authorization: Bearer $TEACHER_TOKEN"
```

### End a Session

```bash
curl -X POST http://localhost:3001/sessions/1/end \
  -H "Authorization: Bearer $TEACHER_TOKEN"
```

---

## 6. LiveKit Token Generation

**Get token for room access:**

```bash
# For teacher
curl -X GET "http://localhost:3001/token?room=test-room&name=John%20Teacher&role=teacher" \
  -H "Authorization: Bearer $TEACHER_TOKEN"

# For student
curl -X GET "http://localhost:3001/token?room=test-room&name=Jane%20Student&role=student" \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# For a session
curl -X GET "http://localhost:3001/token?session_id=1" \
  -H "Authorization: Bearer $TEACHER_TOKEN"
```

**Expected Response:**
```json
{
  "token": "eyJhbG...",
  "serverUrl": "ws://localhost:7880"
}
```

---

## 7. Class Feed Management

### Post to Class Feed

```bash
curl -X POST http://localhost:3001/feed/classes/$CLASS_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "type": "announcement",
    "title": "Midterm Exam Schedule",
    "body": "The midterm exam will be held on March 25th at 10 AM."
  }'
```

**Feed item types:**
- `announcement` - General announcements
- `assignment` - Homework/project postings
- `resource` - Study materials
- `session_recap` - Auto-posted after sessions end

### Get Feed Items

```bash
curl -X GET "http://localhost:3001/feed/classes/$CLASS_ID?page=1&limit=20" \
  -H "Authorization: Bearer $TEACHER_TOKEN"
```

### Delete a Feed Item

```bash
curl -X DELETE http://localhost:3001/feed/1 \
  -H "Authorization: Bearer $TEACHER_TOKEN"
```

---

## 8. File Upload

**Upload a file:**

```bash
curl -X POST http://localhost:3001/upload \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -F "file=@/path/to/your/file.pdf"
```

**Expected Response:**
```json
{
  "fileUrl": "/uploads/1710678901234_abc12.pdf",
  "fileName": "file.pdf"
}
```

**Use uploaded file in feed post:**
```bash
curl -X POST http://localhost:3001/feed/classes/$CLASS_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "type": "resource",
    "title": "Chapter 1 Notes",
    "body": "Download the attached PDF",
    "fileUrl": "/uploads/1710678901234_abc12.pdf",
    "fileName": "file.pdf"
  }'
```

---

## 9. User Authentication

### Login

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@test.edu",
    "password": "TeacherPass123"
  }'
```

### Get Current User

```bash
curl -X GET http://localhost:3001/auth/me \
  -H "Authorization: Bearer $TEACHER_TOKEN"
```

---

## 10. Room Operations (Legacy/Compatibility)

### Create Room

```bash
curl -X POST http://localhost:3001/rooms/create \
  -H "Content-Type: application/json" \
  -d '{
    "roomName": "Quick Session",
    "teacherName": "John Teacher"
  }'
```

### Get Room Info

```bash
curl -X GET http://localhost:3001/rooms/ABC123
```

### List All Rooms

```bash
curl -X GET http://localhost:3001/rooms/list
```

---

## 11. Attendance Tracking

### Mark Attendance (Student Joins Session)

```bash
curl -X POST http://localhost:3001/attendance/$SESSION_ID/mark \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d '{
    "studentId": 5
  }'
```

**Expected Response:**
```json
{
  "attendance": {
    "id": 1,
    "sessionId": 1,
    "studentId": 5,
    "joinedAt": "2026-03-17T10:00:00.000Z",
    "leftAt": null,
    "duration": null
  },
  "message": "Attendance marked"
}
```

### Mark Student Left Session

```bash
curl -X POST http://localhost:3001/attendance/$SESSION_ID/leave \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d '{
    "studentId": 5
  }'
```

**Expected Response:**
```json
{
  "attendance": {
    "id": 1,
    "sessionId": 1,
    "studentId": 5,
    "joinedAt": "2026-03-17T10:00:00.000Z",
    "leftAt": "2026-03-17T10:45:00.000Z",
    "duration": 2700
  },
  "message": "Left at recorded",
  "duration": 2700
}
```

### Get Attendance Report for Session

```bash
curl -X GET http://localhost:3001/attendance/$SESSION_ID/report \
  -H "Authorization: Bearer $TEACHER_TOKEN"
```

**Expected Response:**
```json
{
  "session": {
    "id": 1,
    "title": "Live Lecture: Quadratic Equations",
    "status": "live",
    "startedAt": "2026-03-17T10:00:00.000Z",
    "endedAt": null
  },
  "summary": {
    "totalEnrolled": 25,
    "totalPresent": 20,
    "totalAbsent": 5,
    "attendanceRate": 80
  },
  "students": [
    {
      "student": {
        "id": 5,
        "name": "Jane Student",
        "email": "jane@student.proxima",
        "username": "jane.student"
      },
      "present": true,
      "joinedAt": "2026-03-17T10:00:00.000Z",
      "leftAt": "2026-03-17T10:45:00.000Z",
      "duration": 2700
    },
    {
      "student": { ... },
      "present": false,
      "joinedAt": null,
      "leftAt": null,
      "duration": null
    }
  ]
}
```

### Get Attendance Summary for All Sessions in a Class

```bash
curl -X GET http://localhost:3001/attendance/classes/$CLASS_ID/sessions \
  -H "Authorization: Bearer $TEACHER_TOKEN"
```

**Expected Response:**
```json
{
  "sessions": [
    {
      "session": {
        "id": 1,
        "title": "Live Lecture: Quadratic Equations",
        "status": "ended",
        "startedAt": "2026-03-17T10:00:00.000Z",
        "endedAt": "2026-03-17T10:50:00.000Z"
      },
      "totalPresent": 20,
      "averageDuration": 2500
    }
  ]
}
```

---

## 12. Socket.IO Testing

**Connect to Socket.IO server:**

```javascript
// In browser console or with socket.io-client
const socket = io('http://localhost:3001');

// Join a room
socket.emit('join_room', { roomId: 'ABC123', name: 'Jane Student', role: 'student' });

// Send reaction
socket.emit('student_reaction', { roomId: 'ABC123', studentName: 'Jane Student', type: 'got_it' });

// Raise hand
socket.emit('raise_hand', { roomId: 'ABC123', studentName: 'Jane Student' });

// Lower hand
socket.emit('lower_hand', { roomId: 'ABC123', studentName: 'Jane Student' });

// Listen for events
socket.on('reaction_update', (data) => console.log('Reaction:', data));
socket.on('hand_raised', (data) => console.log('Hand raised:', data));
socket.on('user_joined', (data) => console.log('User joined:', data));
```

---

## 13. Database Inspection

**Open Prisma Studio:**
```bash
cd server
npx prisma studio
```
Opens at `http://localhost:5555`

**Query database directly:**
```bash
cd server
npx prisma db seed  # If you have seed data
```

---

## Quick Test Script

Save as `test-backend.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3001"

echo "=== Proxima Backend Quick Test ==="

# 1. Institution
echo -e "\n1. Creating institution..."
INST_RESP=$(curl -s -X POST "$BASE_URL/institutions/register" \
  -H "Content-Type: application/json" \
  -d '{"institutionName":"Test Uni","slug":"test-uni-'$RANDOM'","adminName":"Admin","adminEmail":"admin'$RANDOM'@test.edu","adminPassword":"Admin123"}')
echo $INST_RESP | jq .

# 2. Teacher
echo -e "\n2. Creating teacher..."
TEACHER_RESP=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Teacher","email":"teacher'$RANDOM'@test.edu","password":"Teacher123","role":"teacher","institutionId":1}')
echo $TEACHER_RESP | jq .
TEACHER_TOKEN=$(echo $TEACHER_RESP | jq -r '.token')

# 3. Class
echo -e "\n3. Creating class..."
CLASS_RESP=$(curl -s -X POST "$BASE_URL/classes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{"name":"Test Class","subject":"Math"}')
echo $CLASS_RESP | jq .
CLASS_ID=$(echo $CLASS_RESP | jq -r '.class.id')
JOIN_KEY=$(echo $CLASS_RESP | jq -r '.class.joinKey')

# 4. Session
echo -e "\n4. Creating session..."
SESSION_RESP=$(curl -s -X POST "$BASE_URL/sessions/classes/$CLASS_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{"title":"Test Session"}')
echo $SESSION_RESP | jq .

# 5. Feed
echo -e "\n5. Posting to feed..."
FEED_RESP=$(curl -s -X POST "$BASE_URL/feed/classes/$CLASS_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{"type":"announcement","title":"Welcome","body":"Hello class!"}')
echo $FEED_RESP | jq .

# 6. Token
echo -e "\n6. Getting LiveKit token..."
TOKEN_RESP=$(curl -s -X GET "$BASE_URL/token?room=test&name=Teacher&role=teacher" \
  -H "Authorization: Bearer $TEACHER_TOKEN")
echo $TOKEN_RESP | jq .

# 7. Attendance Report
echo -e "\n7. Getting attendance report..."
ATTEND_RESP=$(curl -s -X GET "$BASE_URL/attendance/$SESSION_ID/report" \
  -H "Authorization: Bearer $TEACHER_TOKEN")
echo $ATTEND_RESP | jq .

echo -e "\n=== All tests completed ==="
```

**Run the test:**
```bash
chmod +x test-backend.sh
./test-backend.sh
```

---

## Expected Backend Structure

Verify all files exist:

```bash
cd server
tree -L 3
```

Should show:
```
server/
├── server.js
├── package.json
├── .env
├── uploads/
├── prisma/
│   └── schema.prisma
└── src/
    ├── db/
    │   └── index.js
    ├── middleware/
    │   ├── authenticate.js
    │   └── tenantScope.js
    ├── routes/
    │   ├── auth.js
    │   ├── token.js
    │   ├── rooms.js
    │   ├── institutions.js
    │   ├── classes.js
    │   ├── feed.js
    │   ├── sessions.js
    │   ├── enroll.js
    │   └── upload.js
    ├── socket/
    │   └── index.js
    └── store/
        └── index.js
```

---

## 15. Troubleshooting

**Database connection error:**
```bash
docker-compose restart postgres
```

**Port already in use:**
```bash
lsof -i :3001
kill -9 <PID>
```

**Prisma client not generated:**
```bash
cd server
npx prisma generate
```

**Migrations out of sync:**
```bash
cd server
npx prisma migrate reset
```
