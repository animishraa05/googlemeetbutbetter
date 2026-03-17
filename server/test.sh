#!/bin/bash

# ============================================================
# Proxima Backend Test Suite
# Runs all API tests in order and logs results to test.log
# Usage: chmod +x test.sh && ./test.sh
# ============================================================

BASE_URL="http://localhost:3001"
LOG_FILE="test_results.log"
PASS=0
FAIL=0
TOTAL=0

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Shared state across tests
ADMIN_TOKEN=""
TEACHER_TOKEN=""
STUDENT_TOKEN=""
INSTITUTION_ID=""
CLASS_ID=""
JOIN_KEY=""
SESSION_ID=""
FEED_ITEM_ID=""
ROOM_ID=""

# ============================================================
# Utility functions
# ============================================================

log() {
  echo "$1" | tee -a "$LOG_FILE"
}

log_section() {
  local msg="$1"
  log ""
  log "============================================================"
  log "  $msg"
  log "============================================================"
  echo -e "${CYAN}$msg${NC}"
}

log_test() {
  local name="$1"
  local result="$2"
  local detail="$3"

  TOTAL=$((TOTAL + 1))

  if [ "$result" = "PASS" ]; then
    PASS=$((PASS + 1))
    echo -e "  ${GREEN}PASS${NC}  $name"
    log "  [PASS]  $name"
  else
    FAIL=$((FAIL + 1))
    echo -e "  ${RED}FAIL${NC}  $name"
    log "  [FAIL]  $name"
    if [ -n "$detail" ]; then
      echo -e "         ${RED}→ $detail${NC}"
      log "         → $detail"
    fi
  fi
}

log_response() {
  local label="$1"
  local response="$2"
  log ""
  log "  --- $label ---"
  log "$response"
  log ""
}

check_field() {
  local json="$1"
  local field="$2"
  echo "$json" | grep -q "\"$field\""
}

extract() {
  local json="$1"
  local key="$2"
  echo "$json" | grep -o "\"$key\":[^,}]*" | head -1 | sed 's/.*: *//' | tr -d '"'
}

# ============================================================
# Initialize log file
# ============================================================

> "$LOG_FILE"
log "Proxima Backend Test Suite"
log "Run at: $(date)"
log "Target: $BASE_URL"
log ""

# ============================================================
# 0. Prerequisites
# ============================================================

log_section "0. Prerequisites"

# Check server is reachable
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/rooms/list" 2>/dev/null)
if [ "$HEALTH" = "200" ] || [ "$HEALTH" = "401" ]; then
  log_test "Server is reachable on $BASE_URL" "PASS"
else
  log_test "Server is reachable on $BASE_URL" "FAIL" "HTTP $HEALTH — is the server running? Run: cd server && npm run dev"
  log ""
  log "ABORTING — server not reachable. Start backend first."
  echo -e "${RED}ABORTING — server not reachable. Run: cd server && npm run dev${NC}"
  exit 1
fi

# Check Docker services
DOCKER_RUNNING=$(docker-compose ps 2>/dev/null | grep -c "Up")
if [ "$DOCKER_RUNNING" -ge "1" ]; then
  log_test "Docker services running" "PASS"
else
  log_test "Docker services running" "FAIL" "Run: docker-compose up -d"
fi

# Check jq is available (used for pretty printing)
if command -v jq &> /dev/null; then
  log_test "jq is installed (pretty printing enabled)" "PASS"
  JQ_AVAILABLE=true
else
  log_test "jq not installed — responses will be raw JSON" "PASS"
  JQ_AVAILABLE=false
fi

pretty() {
  if [ "$JQ_AVAILABLE" = true ]; then
    echo "$1" | jq . 2>/dev/null || echo "$1"
  else
    echo "$1"
  fi
}

# ============================================================
# 1. Institution Registration
# ============================================================

log_section "1. Institution Registration"

SLUG="test-proxima-$RANDOM"
RESP=$(curl -s -X POST "$BASE_URL/institutions/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"institutionName\": \"Test University\",
    \"slug\": \"$SLUG\",
    \"adminName\": \"Admin User\",
    \"adminEmail\": \"admin.$RANDOM@test.edu\",
    \"adminPassword\": \"AdminPass123\"
  }")

log_response "POST /institutions/register" "$(pretty "$RESP")"

if check_field "$RESP" "token" && check_field "$RESP" "institution"; then
  ADMIN_TOKEN=$(extract "$RESP" "token")
  INSTITUTION_ID=$(extract "$RESP" "id")
  log_test "Institution created successfully" "PASS"
  log_test "Admin token received" "PASS"
  log "  Institution ID: $INSTITUTION_ID"
  log "  Slug: $SLUG"
else
  log_test "Institution registration" "FAIL" "$(extract "$RESP" "error")"
fi

# Duplicate slug should fail
RESP_DUP=$(curl -s -X POST "$BASE_URL/institutions/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"institutionName\": \"Dupe\",
    \"slug\": \"$SLUG\",
    \"adminName\": \"Admin2\",
    \"adminEmail\": \"admin2@test.edu\",
    \"adminPassword\": \"AdminPass123\"
  }")

if check_field "$RESP_DUP" "error"; then
  log_test "Duplicate slug correctly rejected" "PASS"
else
  log_test "Duplicate slug correctly rejected" "FAIL" "Should have returned error for duplicate slug"
fi

# Get institution by slug
RESP_GET=$(curl -s "$BASE_URL/institutions/$SLUG")
log_response "GET /institutions/:slug" "$(pretty "$RESP_GET")"
if check_field "$RESP_GET" "institution"; then
  log_test "Get institution by slug" "PASS"
else
  log_test "Get institution by slug" "FAIL" "$(extract "$RESP_GET" "error")"
fi

# ============================================================
# 2. Auth — Register and Login
# ============================================================

log_section "2. Auth — Register and Login"

TEACHER_EMAIL="teacher.$RANDOM@test.edu"

# Register teacher
RESP=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"John Teacher\",
    \"email\": \"$TEACHER_EMAIL\",
    \"password\": \"TeacherPass123\",
    \"role\": \"teacher\",
    \"institutionId\": $INSTITUTION_ID
  }")

log_response "POST /auth/register (teacher)" "$(pretty "$RESP")"

if check_field "$RESP" "token" && check_field "$RESP" "user"; then
  TEACHER_TOKEN=$(extract "$RESP" "token")
  log_test "Teacher registered successfully" "PASS"
else
  log_test "Teacher registration" "FAIL" "$(extract "$RESP" "error")"
fi

# Register duplicate email should fail
RESP_DUP=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Duplicate\",
    \"email\": \"$TEACHER_EMAIL\",
    \"password\": \"Pass123\",
    \"role\": \"teacher\",
    \"institutionId\": $INSTITUTION_ID
  }")

if check_field "$RESP_DUP" "error"; then
  log_test "Duplicate email correctly rejected" "PASS"
else
  log_test "Duplicate email correctly rejected" "FAIL" "Should have returned error"
fi

# Register with missing fields
RESP_BAD=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"No Email\"}")

if check_field "$RESP_BAD" "error"; then
  log_test "Missing fields correctly rejected on register" "PASS"
else
  log_test "Missing fields correctly rejected on register" "FAIL"
fi

# Login
RESP=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEACHER_EMAIL\",
    \"password\": \"TeacherPass123\"
  }")

log_response "POST /auth/login" "$(pretty "$RESP")"

if check_field "$RESP" "token"; then
  log_test "Login with correct credentials" "PASS"
else
  log_test "Login with correct credentials" "FAIL" "$(extract "$RESP" "error")"
fi

# Wrong password
RESP_WRONG=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEACHER_EMAIL\", \"password\": \"WrongPass\"}")

if check_field "$RESP_WRONG" "error"; then
  log_test "Wrong password correctly rejected" "PASS"
else
  log_test "Wrong password correctly rejected" "FAIL"
fi

# GET /auth/me with token
RESP=$(curl -s "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TEACHER_TOKEN")

log_response "GET /auth/me (with token)" "$(pretty "$RESP")"

if check_field "$RESP" "user"; then
  log_test "GET /auth/me with valid token" "PASS"
else
  log_test "GET /auth/me with valid token" "FAIL" "$(extract "$RESP" "error")"
fi

# GET /auth/me without token
RESP_NO_AUTH=$(curl -s "$BASE_URL/auth/me")
if check_field "$RESP_NO_AUTH" "error"; then
  log_test "GET /auth/me without token returns 401" "PASS"
else
  log_test "GET /auth/me without token returns 401" "FAIL" "Should have returned auth error"
fi

# ============================================================
# 3. Class Management
# ============================================================

log_section "3. Class Management"

# Create class
RESP=$(curl -s -X POST "$BASE_URL/classes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "name": "Mathematics 101",
    "subject": "Math",
    "description": "Introduction to Algebra"
  }')

log_response "POST /classes" "$(pretty "$RESP")"

if check_field "$RESP" "joinKey" && check_field "$RESP" "class"; then
  CLASS_ID=$(extract "$RESP" "id")
  JOIN_KEY=$(extract "$RESP" "joinKey")
  log_test "Class created successfully" "PASS"
  log "  Class ID: $CLASS_ID"
  log "  Join Key: $JOIN_KEY"
else
  log_test "Class creation" "FAIL" "$(extract "$RESP" "error")"
fi

# Create class without auth
RESP_NO_AUTH=$(curl -s -X POST "$BASE_URL/classes" \
  -H "Content-Type: application/json" \
  -d '{"name": "Unauthorized Class"}')

if check_field "$RESP_NO_AUTH" "error"; then
  log_test "Create class without auth returns 401" "PASS"
else
  log_test "Create class without auth returns 401" "FAIL"
fi

# Get classes list
RESP=$(curl -s "$BASE_URL/classes" \
  -H "Authorization: Bearer $TEACHER_TOKEN")

log_response "GET /classes (teacher)" "$(pretty "$RESP")"

if check_field "$RESP" "classes"; then
  log_test "GET /classes returns class list" "PASS"
else
  log_test "GET /classes" "FAIL" "$(extract "$RESP" "error")"
fi

# Get single class
RESP=$(curl -s "$BASE_URL/classes/$CLASS_ID" \
  -H "Authorization: Bearer $TEACHER_TOKEN")

log_response "GET /classes/:id" "$(pretty "$RESP")"

if check_field "$RESP" "class"; then
  log_test "GET /classes/:id returns class" "PASS"
else
  log_test "GET /classes/:id" "FAIL" "$(extract "$RESP" "error")"
fi

# Get class by join key (public)
RESP=$(curl -s "$BASE_URL/classes/join/$JOIN_KEY")

log_response "GET /classes/join/:joinKey" "$(pretty "$RESP")"

if check_field "$RESP" "className"; then
  log_test "GET /classes/join/:joinKey returns preview" "PASS"
else
  log_test "GET /classes/join/:joinKey" "FAIL" "$(extract "$RESP" "error")"
fi

# Invalid join key
RESP_BAD=$(curl -s "$BASE_URL/classes/join/INVALID-KEY-0000")
if check_field "$RESP_BAD" "error"; then
  log_test "Invalid join key correctly returns 404" "PASS"
else
  log_test "Invalid join key correctly returns 404" "FAIL"
fi

# ============================================================
# 4. Student Enrollment
# ============================================================

log_section "4. Student Enrollment via Join Key"

STUDENT_USERNAME="student$RANDOM"

RESP=$(curl -s -X POST "$BASE_URL/enroll" \
  -H "Content-Type: application/json" \
  -d "{
    \"joinKey\": \"$JOIN_KEY\",
    \"name\": \"Jane Student\",
    \"username\": \"$STUDENT_USERNAME\",
    \"password\": \"StudentPass123\"
  }")

log_response "POST /enroll" "$(pretty "$RESP")"

if check_field "$RESP" "token" && check_field "$RESP" "classId"; then
  STUDENT_TOKEN=$(extract "$RESP" "token")
  log_test "Student enrolled successfully via join key" "PASS"
  log "  Student username: $STUDENT_USERNAME"
else
  log_test "Student enrollment" "FAIL" "$(extract "$RESP" "error")"
fi

# Duplicate username in same institution
RESP_DUP=$(curl -s -X POST "$BASE_URL/enroll" \
  -H "Content-Type: application/json" \
  -d "{
    \"joinKey\": \"$JOIN_KEY\",
    \"name\": \"Duplicate Student\",
    \"username\": \"$STUDENT_USERNAME\",
    \"password\": \"StudentPass123\"
  }")

if check_field "$RESP_DUP" "error"; then
  log_test "Duplicate username correctly rejected" "PASS"
else
  log_test "Duplicate username correctly rejected" "FAIL"
fi

# Enroll with invalid join key
RESP_BAD=$(curl -s -X POST "$BASE_URL/enroll" \
  -H "Content-Type: application/json" \
  -d '{
    "joinKey": "FAKE-KEY-0000",
    "name": "Bad Student",
    "username": "badstudent",
    "password": "Pass123"
  }')

if check_field "$RESP_BAD" "error"; then
  log_test "Enrollment with invalid join key rejected" "PASS"
else
  log_test "Enrollment with invalid join key rejected" "FAIL"
fi

# Student can see their classes
RESP=$(curl -s "$BASE_URL/classes" \
  -H "Authorization: Bearer $STUDENT_TOKEN")

log_response "GET /classes (student)" "$(pretty "$RESP")"

if check_field "$RESP" "classes"; then
  log_test "Student can see enrolled classes" "PASS"
else
  log_test "Student can see enrolled classes" "FAIL"
fi

# ============================================================
# 5. Livekit Token
# ============================================================

log_section "5. Livekit Token Generation"

# Teacher gets token
RESP=$(curl -s "$BASE_URL/token?room=test-room&name=John%20Teacher&role=teacher" \
  -H "Authorization: Bearer $TEACHER_TOKEN")

log_response "GET /token (teacher)" "$(pretty "$RESP")"

if check_field "$RESP" "token" && check_field "$RESP" "serverUrl"; then
  log_test "Teacher gets Livekit token" "PASS"
else
  log_test "Teacher gets Livekit token" "FAIL" "$(extract "$RESP" "error")"
fi

# Student gets token
RESP=$(curl -s "$BASE_URL/token?room=test-room&name=Jane%20Student&role=student" \
  -H "Authorization: Bearer $STUDENT_TOKEN")

log_response "GET /token (student)" "$(pretty "$RESP")"

if check_field "$RESP" "token"; then
  log_test "Student gets Livekit token" "PASS"
else
  log_test "Student gets Livekit token" "FAIL" "$(extract "$RESP" "error")"
fi

# No auth token — should fail
RESP_NO_AUTH=$(curl -s "$BASE_URL/token?room=test-room&name=Hacker&role=teacher")
if check_field "$RESP_NO_AUTH" "error"; then
  log_test "Token endpoint protected — rejects unauthenticated request" "PASS"
else
  log_test "Token endpoint protected — rejects unauthenticated request" "FAIL" "Should have returned 401"
fi

# Missing room param
RESP_BAD=$(curl -s "$BASE_URL/token?name=Teacher&role=teacher" \
  -H "Authorization: Bearer $TEACHER_TOKEN")

if check_field "$RESP_BAD" "error"; then
  log_test "Missing room param correctly rejected" "PASS"
else
  log_test "Missing room param correctly rejected" "FAIL"
fi

# ============================================================
# 6. Live Session Management
# ============================================================

log_section "6. Live Session Management"

# Create session
RESP=$(curl -s -X POST "$BASE_URL/sessions/classes/$CLASS_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "title": "Live Lecture: Quadratic Equations",
    "scheduledAt": "2026-03-25T10:00:00Z"
  }')

log_response "POST /sessions/classes/:id" "$(pretty "$RESP")"

if check_field "$RESP" "session"; then
  SESSION_ID=$(extract "$RESP" "id")
  log_test "Session created successfully" "PASS"
  log "  Session ID: $SESSION_ID"
else
  log_test "Session creation" "FAIL" "$(extract "$RESP" "error")"
fi

# Student cannot create session
RESP_STUDENT=$(curl -s -X POST "$BASE_URL/sessions/classes/$CLASS_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d '{"title": "Student Session"}')

if check_field "$RESP_STUDENT" "error"; then
  log_test "Student cannot create session" "PASS"
else
  log_test "Student cannot create session" "FAIL" "Should have returned 403"
fi

# Get sessions for class
RESP=$(curl -s "$BASE_URL/sessions/classes/$CLASS_ID" \
  -H "Authorization: Bearer $TEACHER_TOKEN")

log_response "GET /sessions/classes/:id" "$(pretty "$RESP")"

if check_field "$RESP" "sessions"; then
  log_test "GET sessions for class" "PASS"
else
  log_test "GET sessions for class" "FAIL"
fi

# Start session
RESP=$(curl -s -X POST "$BASE_URL/sessions/$SESSION_ID/start" \
  -H "Authorization: Bearer $TEACHER_TOKEN")

log_response "POST /sessions/:id/start" "$(pretty "$RESP")"

if check_field "$RESP" "session"; then
  SESSION_STATUS=$(extract "$RESP" "status")
  if echo "$RESP" | grep -q '"status":"live"'; then
    log_test "Session started — status is live" "PASS"
  else
    log_test "Session started — status is live" "FAIL" "Status was: $SESSION_STATUS"
  fi
else
  log_test "Session start" "FAIL" "$(extract "$RESP" "error")"
fi

# Token with session_id
RESP=$(curl -s "$BASE_URL/token?session_id=$SESSION_ID" \
  -H "Authorization: Bearer $TEACHER_TOKEN")

log_response "GET /token?session_id= (teacher)" "$(pretty "$RESP")"

if check_field "$RESP" "token"; then
  log_test "Get Livekit token via session_id" "PASS"
else
  log_test "Get Livekit token via session_id" "FAIL" "$(extract "$RESP" "error")"
fi

# End session
RESP=$(curl -s -X POST "$BASE_URL/sessions/$SESSION_ID/end" \
  -H "Authorization: Bearer $TEACHER_TOKEN")

log_response "POST /sessions/:id/end" "$(pretty "$RESP")"

if check_field "$RESP" "session"; then
  if echo "$RESP" | grep -q '"status":"ended"'; then
    log_test "Session ended — status is ended" "PASS"
  else
    log_test "Session ended — status is ended" "FAIL"
  fi
else
  log_test "Session end" "FAIL" "$(extract "$RESP" "error")"
fi

# ============================================================
# 7. Class Feed
# ============================================================

log_section "7. Class Feed"

# Post announcement
RESP=$(curl -s -X POST "$BASE_URL/feed/classes/$CLASS_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "type": "announcement",
    "title": "Midterm Schedule",
    "body": "The midterm exam will be held on March 25th at 10 AM."
  }')

log_response "POST /feed/classes/:id (announcement)" "$(pretty "$RESP")"

if check_field "$RESP" "item"; then
  FEED_ITEM_ID=$(extract "$RESP" "id")
  log_test "Announcement posted to feed" "PASS"
  log "  Feed item ID: $FEED_ITEM_ID"
else
  log_test "Post announcement to feed" "FAIL" "$(extract "$RESP" "error")"
fi

# Post note
RESP=$(curl -s -X POST "$BASE_URL/feed/classes/$CLASS_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -d '{
    "type": "note",
    "title": "Chapter 1 Notes",
    "body": "Key concepts from chapter 1..."
  }')

if check_field "$RESP" "item"; then
  log_test "Note posted to feed" "PASS"
else
  log_test "Note posted to feed" "FAIL"
fi

# Student cannot post
RESP_STUDENT=$(curl -s -X POST "$BASE_URL/feed/classes/$CLASS_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d '{"type": "announcement", "body": "Student post attempt"}')

if check_field "$RESP_STUDENT" "error"; then
  log_test "Student cannot post to feed" "PASS"
else
  log_test "Student cannot post to feed" "FAIL" "Should have returned 403"
fi

# Get feed
RESP=$(curl -s "$BASE_URL/feed/classes/$CLASS_ID?page=1&limit=20" \
  -H "Authorization: Bearer $TEACHER_TOKEN")

log_response "GET /feed/classes/:id" "$(pretty "$RESP")"

if check_field "$RESP" "items"; then
  log_test "GET feed returns items" "PASS"
else
  log_test "GET feed" "FAIL" "$(extract "$RESP" "error")"
fi

# Student can read feed
RESP_STUDENT=$(curl -s "$BASE_URL/feed/classes/$CLASS_ID" \
  -H "Authorization: Bearer $STUDENT_TOKEN")

if check_field "$RESP_STUDENT" "items"; then
  log_test "Student can read class feed" "PASS"
else
  log_test "Student can read class feed" "FAIL"
fi

# Delete feed item
RESP=$(curl -s -X DELETE "$BASE_URL/feed/$FEED_ITEM_ID" \
  -H "Authorization: Bearer $TEACHER_TOKEN")

log_response "DELETE /feed/:id" "$(pretty "$RESP")"

if check_field "$RESP" "deleted"; then
  log_test "Feed item deleted successfully" "PASS"
else
  log_test "Feed item deletion" "FAIL" "$(extract "$RESP" "error")"
fi

# ============================================================
# 8. File Upload
# ============================================================

log_section "8. File Upload"

# Create a test file
echo "This is a test PDF file content for Proxima testing" > /tmp/proxima_test.txt

RESP=$(curl -s -X POST "$BASE_URL/upload" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -F "file=@/tmp/proxima_test.txt")

log_response "POST /upload" "$(pretty "$RESP")"

if check_field "$RESP" "url"; then
  FILE_URL=$(extract "$RESP" "url")
  log_test "File uploaded successfully" "PASS"
  log "  File URL: $FILE_URL"

  # Post file to feed
  RESP_FEED=$(curl -s -X POST "$BASE_URL/feed/classes/$CLASS_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TEACHER_TOKEN" \
    -d "{
      \"type\": \"file\",
      \"title\": \"Test Document\",
      \"fileUrl\": \"$FILE_URL\",
      \"fileName\": \"proxima_test.txt\"
    }")

  if check_field "$RESP_FEED" "item"; then
    log_test "File feed item created after upload" "PASS"
  else
    log_test "File feed item creation" "FAIL"
  fi
else
  log_test "File upload" "FAIL" "$(extract "$RESP" "error")"
fi

# Upload without auth
RESP_NO_AUTH=$(curl -s -X POST "$BASE_URL/upload" \
  -F "file=@/tmp/proxima_test.txt")

if check_field "$RESP_NO_AUTH" "error"; then
  log_test "Upload without auth correctly rejected" "PASS"
else
  log_test "Upload without auth correctly rejected" "FAIL"
fi

# Clean up test file
rm -f /tmp/proxima_test.txt

# ============================================================
# 9. Legacy Room Management
# ============================================================

log_section "9. Legacy Room Management (in-memory)"

# Create room
RESP=$(curl -s -X POST "$BASE_URL/rooms/create" \
  -H "Content-Type: application/json" \
  -d '{
    "roomName": "Quick Session",
    "teacherName": "John Teacher"
  }')

log_response "POST /rooms/create" "$(pretty "$RESP")"

if check_field "$RESP" "roomId"; then
  ROOM_ID=$(extract "$RESP" "roomId")
  log_test "Legacy room created" "PASS"
  log "  Room ID: $ROOM_ID"
else
  log_test "Legacy room creation" "FAIL" "$(extract "$RESP" "error")"
fi

# List rooms
RESP=$(curl -s "$BASE_URL/rooms/list")

log_response "GET /rooms/list" "$(pretty "$RESP")"

if echo "$RESP" | grep -q "\["; then
  log_test "GET /rooms/list returns array" "PASS"
else
  log_test "GET /rooms/list" "FAIL"
fi

# Get specific room
RESP=$(curl -s "$BASE_URL/rooms/$ROOM_ID")

log_response "GET /rooms/:roomId" "$(pretty "$RESP")"

if check_field "$RESP" "id"; then
  log_test "GET /rooms/:id returns room data" "PASS"
else
  log_test "GET /rooms/:id" "FAIL" "$(extract "$RESP" "error")"
fi

# Get non-existent room
RESP_404=$(curl -s "$BASE_URL/rooms/fake_room_id_0000")
if check_field "$RESP_404" "error"; then
  log_test "Non-existent room returns 404" "PASS"
else
  log_test "Non-existent room returns 404" "FAIL"
fi

# ============================================================
# 10. Socket.io connection check
# ============================================================

log_section "10. Socket.io Health Check"

# Check if Socket.io endpoint responds
SOCKET_RESP=$(curl -s -o /dev/null -w "%{http_code}" \
  "$BASE_URL/socket.io/?EIO=4&transport=polling")

if [ "$SOCKET_RESP" = "200" ]; then
  log_test "Socket.io endpoint is reachable" "PASS"
else
  log_test "Socket.io endpoint is reachable" "FAIL" "HTTP $SOCKET_RESP — expected 200"
fi

# ============================================================
# 11. Security tests
# ============================================================

log_section "11. Security Checks"

# Expired / malformed token
RESP=$(curl -s "$BASE_URL/auth/me" \
  -H "Authorization: Bearer this.is.not.a.valid.jwt")

if check_field "$RESP" "error"; then
  log_test "Malformed JWT correctly rejected" "PASS"
else
  log_test "Malformed JWT correctly rejected" "FAIL"
fi

# No bearer prefix
RESP=$(curl -s "$BASE_URL/auth/me" \
  -H "Authorization: $TEACHER_TOKEN")

if check_field "$RESP" "error"; then
  log_test "Token without Bearer prefix correctly rejected" "PASS"
else
  log_test "Token without Bearer prefix correctly rejected" "FAIL"
fi

# Empty bearer
RESP=$(curl -s "$BASE_URL/auth/me" \
  -H "Authorization: Bearer ")

if check_field "$RESP" "error"; then
  log_test "Empty Bearer token correctly rejected" "PASS"
else
  log_test "Empty Bearer token correctly rejected" "FAIL"
fi

# ============================================================
# Summary
# ============================================================

log ""
log "============================================================"
log "  TEST SUMMARY"
log "============================================================"
log "  Total tests : $TOTAL"
log "  Passed      : $PASS"
log "  Failed      : $FAIL"
log "  Success rate: $(( PASS * 100 / TOTAL ))%"
log ""
log "  Full log saved to: $LOG_FILE"
log "  Run at: $(date)"
log "============================================================"

echo ""
echo "============================================================"
echo "  TEST SUMMARY"
echo "============================================================"
echo -e "  Total  : $TOTAL"
echo -e "  ${GREEN}Passed : $PASS${NC}"
if [ "$FAIL" -gt 0 ]; then
  echo -e "  ${RED}Failed : $FAIL${NC}"
else
  echo -e "  Failed : $FAIL"
fi
echo -e "  Rate   : $(( PASS * 100 / TOTAL ))%"
echo ""
echo -e "  Full log: ${CYAN}$LOG_FILE${NC}"
echo "============================================================"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo -e "${YELLOW}  Check $LOG_FILE for detailed failure reasons${NC}"
  exit 1
else
  echo ""
  echo -e "${GREEN}  All tests passed.${NC}"
  exit 0
fi
