# Proxima Frontend Implementation Plan

Complete mapping of all frontend pages, components, contexts, and their functionality.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Core Setup Files](#core-setup-files)
3. [Context & State Management](#context--state-management)
4. [API Layer](#api-layer)
5. [Socket Layer](#socket-layer)
6. [Pages Overview](#pages-overview)
7. [Detailed Page Specifications](#detailed-page-specifications)
8. [Reusable Components](#reusable-components)
9. [Implementation Order](#implementation-order)

---

## Project Structure

```
frontend/
├── .env                          # Environment variables
├── package.json                  # Dependencies
├── vite.config.ts                # Vite configuration
├── index.html                    # HTML entry point
└── src/
    ├── main.tsx                  # React entry point
    ├── api.ts                    # API client & endpoints
    ├── socket.ts                 # Socket.IO client
    ├── styles/
    │   └── index.css             # Global styles
    ├── types/
    │   └── index.ts              # TypeScript types
    ├── app/
    │   ├── App.tsx               # Root component
    │   ├── routes.tsx            # All routes
    │   ├── context/
    │   │   ├── AuthContext.tsx   # Authentication state
    │   │   └── SocketContext.tsx # Socket connection state
    │   ├── components/
    │   │   ├── ProtectedRoute.tsx      # Auth guard
    │   │   ├── ProximaNav.tsx          # Navigation bar
    │   │   ├── FeedItem.tsx            # Feed post card
    │   │   ├── FileUpload.tsx          # File upload component
    │   │   ├── SessionCard.tsx         # Session display card
    │   │   ├── CreatePost.tsx          # Post creation form
    │   │   ├── JoinKeyDisplay.tsx      # Copyable join key
    │   │   ├── StudentList.tsx         # Enrolled students
    │   │   ├── UpcomingSessions.tsx    # Session schedule widget
    │   │   └── AttendanceReport.tsx    # Attendance table
    │   └── pages/
    │       ├── InstitutionRegisterPage.tsx  # NEW
    │       ├── LoginPage.tsx                  # EXISTING (update)
    │       ├── RegisterPage.tsx               # EXISTING (update)
    │       ├── JoinClassPage.tsx              # NEW
    │       ├── DashboardPage.tsx              # NEW (replaces LandingPage)
    │       ├── AdminPage.tsx                  # NEW
    │       ├── ClassFeedPage.tsx              # NEW
    │       ├── TeacherRoomPage.tsx            # EXISTING (update)
    │       └── StudentRoomPage.tsx            # EXISTING (update)
    └── hooks/
        ├── useAuth.ts              # Auth hook
        ├── useSocket.ts            # Socket hook
        ├── useAttendance.ts        # Attendance hook
        └── useFeed.ts              # Feed hook
```

---

## Core Setup Files

### 1. `.env`

**Purpose:** Environment configuration

**Variables:**
```
VITE_API_URL=http://localhost:3001
VITE_LIVEKIT_HOST=ws://localhost:7880
```

---

### 2. `package.json`

**Purpose:** Dependencies

**Already Installed:**
- React 18.3.1
- React Router 7.13.0
- Material UI 7.3.5
- LiveKit SDK & Components
- Axios
- Socket.IO Client (need to add)
- Radix UI components
- Tailwind CSS 4.1.12

**To Add:**
```json
{
  "dependencies": {
    "socket.io-client": "^4.6.0"
  }
}
```

---

### 3. `vite.config.ts`

**Purpose:** Vite bundler configuration

**Current:** Already configured for React + TypeScript

---

### 4. `index.html`

**Purpose:** HTML entry point

**Current:** Already set up with root div

---

## Context & State Management

### 1. `src/app/context/AuthContext.tsx`

**Purpose:** Global authentication state and user session management

**State:**
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'institution_admin' | 'teacher' | 'student';
  institutionId?: number;
  username?: string;
}
```

**Functions:**
```typescript
login(email: string, password: string): Promise<void>
register(data: RegisterData): Promise<void>
logout(): void
checkAuth(): Promise<void>  // Validate token on mount
```

**Features:**
- Stores token in localStorage
- Auto-refresh on token expiry
- Redirects to login on 401 errors
- Provides user info to all components

---

### 2. `src/app/context/SocketContext.tsx`

**Purpose:** Manage Socket.IO connection globally

**State:**
```typescript
interface SocketState {
  isConnected: boolean;
  socket: Socket | null;
}
```

**Functions:**
```typescript
connect(): void
disconnect(): void
emit(event: string, data: any): void
on(event: string, callback: Function): void
off(event: string): void
```

**Features:**
- Single socket connection across app
- Auto-reconnect on disconnect
- Clean up on unmount

---

## API Layer

### `src/api.ts`

**Purpose:** Centralized API client with authentication

**Structure:**
```typescript
// Axios instance with interceptors
const api = axios.create({ baseURL: API_BASE });

// Request interceptor: Add Bearer token
// Response interceptor: Handle 401 errors

// API modules
export const authAPI = { ... }
export const institutionAPI = { ... }
export const classAPI = { ... }
export const enrollAPI = { ... }
export const sessionAPI = { ... }
export const feedAPI = { ... }
export const tokenAPI = { ... }
export const uploadAPI = { ... }
export const attendanceAPI = { ... }
```

**All Endpoints:**

| Module | Method | Endpoint | Auth | Purpose |
|--------|--------|----------|------|---------|
| auth | POST | /auth/register | No | Register user |
| auth | POST | /auth/login | No | Login |
| auth | GET | /auth/me | Yes | Get current user |
| institutions | POST | /institutions/register | No | Register institution |
| institutions | GET | /institutions/:slug | No | Get institution info |
| classes | POST | /classes | Yes | Create class |
| classes | GET | /classes | Yes | Get user's classes |
| classes | GET | /classes/:id | Yes | Get class details |
| classes | GET | /classes/join/:key | No | Get class by join key |
| enroll | POST | /enroll | No | Student enrollment |
| sessions | POST | /sessions/classes/:id | Yes | Create session |
| sessions | POST | /sessions/:id/start | Yes | Start session |
| sessions | POST | /sessions/:id/end | Yes | End session |
| sessions | GET | /sessions/classes/:id | Yes | Get all sessions |
| feed | GET | /feed/classes/:id | Yes | Get feed items |
| feed | POST | /feed/classes/:id | Yes | Create post |
| feed | DELETE | /feed/:id | Yes | Delete post |
| token | GET | /token | Yes | Get LiveKit token |
| upload | POST | /upload | Yes | Upload file |
| attendance | POST | /attendance/:id/mark | Yes | Mark present |
| attendance | POST | /attendance/:id/leave | Yes | Mark left |
| attendance | GET | /attendance/:id/report | Yes | Get report |
| attendance | GET | /attendance/classes/:id/sessions | Yes | Get session summary |
| rooms | POST | /rooms/create | No | Create legacy room |
| rooms | GET | /rooms/:id | No | Get room |
| rooms | GET | /rooms/list | No | List rooms |

---

## Socket Layer

### `src/socket.ts`

**Purpose:** Socket.IO client for real-time features

**Events Emitted (Client → Server):**
```typescript
join_room: { roomId, name, role }
join_session: { sessionId, studentId }
leave_session: { sessionId, studentId }
student_reaction: { roomId, studentName, type }
annotation: { roomId, x0, y0, x1, y1, color, tool }
annotation_clear: { roomId }
attention_score: { roomId, studentName, score }
raise_hand: { roomId, studentName }
lower_hand: { roomId, studentName }
```

**Events Received (Server → Client):**
```typescript
user_joined: { name, role }
user_left: { name, role }
reaction_update: { from, type, counts }
annotation: { roomId, x0, y0, x1, y1, ... }
annotation_clear: { roomId }
attention_update: { studentName, score, allScores }
hand_raised: { studentName }
hand_lowered: { studentName }
error: { message }
```

---

## Pages Overview

| Page | Route | Auth | Roles | Purpose |
|------|-------|------|-------|---------|
| InstitutionRegister | /institution/register | No | Public | Register new institution |
| Login | / | No | All | User login |
| Register | /register | No | All | User registration |
| JoinClass | /join | No | Student | Student enrollment via join key |
| Dashboard | /dashboard | Yes | All | List all user's classes |
| Admin | /admin | Yes | institution_admin | Institution admin panel |
| AdminClasses | /admin/classes | Yes | institution_admin | Manage classes |
| ClassFeed | /classes/:id | Yes | Enrolled | Class feed & live sessions |
| TeacherRoom | /classes/:id/session/:sid/teacher | Yes | teacher | Live session (teacher) |
| StudentRoom | /classes/:id/session/:sid/student | Yes | student | Live session (student) |

---

## Detailed Page Specifications

### 1. InstitutionRegisterPage

**Route:** `/institution/register`

**Purpose:** Register a new school/coaching centre on Proxima

**UI Components:**
```
┌─────────────────────────────────────────┐
│  ProximaNav (minimal, no user menu)     │
├─────────────────────────────────────────┤
│                                         │
│  Institution Registration Form          │
│  ┌───────────────────────────────────┐  │
│  │ Institution Name                  │  │
│  │ [________________________________]│  │
│  │                                   │  │
│  │ Slug (unique identifier)          │  │
│  │ [________________________________]│  │
│  │                                   │  │
│  │ Admin Name                        │  │
│  │ [________________________________]│  │
│  │                                   │  │
│  │ Admin Email                       │  │
│  │ [________________________________]│  │
│  │                                   │  │
│  │ Admin Password                    │  │
│  │ [________________________________]│  │
│  │                                   │  │
│  │ [Register Institution]            │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

**Form Fields:**
- institutionName (required, 2-100 chars)
- slug (required, alphanumeric, unique, auto-suggest from name)
- adminName (required, 2-50 chars)
- adminEmail (required, email format)
- adminPassword (required, min 8 chars, letter + number)

**On Submit:**
1. Call `institutionAPI.register()`
2. Store returned token and user in AuthContext
3. Redirect to `/admin` (institution admin dashboard)

**Validation:**
- Check slug availability (debounced API call)
- Email format validation
- Password strength indicator

---

### 2. LoginPage

**Route:** `/`

**Purpose:** User login

**UI Components:**
```
┌─────────────────────────────────────────┐
│  ProximaNav (minimal)                   │
├─────────────────────────────────────────┤
│                                         │
│  Login Form                             │
│  ┌───────────────────────────────────┐  │
│  │ Email                             │  │
│  │ [________________________________]│  │
│  │                                   │  │
│  │ Password                          │  │
│  │ [________________________________]│  │
│  │                                   │  │
│  │ [ ] Remember me                   │  │
│  │                                   │  │
│  │ [Login]                           │  │
│  │                                   │  │
│  │ Don't have an account?            │  │
│  │ - Student: Join via join key      │  │
│  │ - Teacher/Admin: Contact school   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [Join a Class] [Register Institution]  │
│                                         │
└─────────────────────────────────────────┘
```

**Form Fields:**
- email (required)
- password (required)

**On Submit:**
1. Call `authAPI.login()`
2. Store token in AuthContext
3. Redirect based on role:
   - institution_admin → `/admin`
   - teacher → `/dashboard`
   - student → `/dashboard`

**Quick Actions:**
- "Join a Class" → `/join`
- "Register Institution" → `/institution/register`

---

### 3. RegisterPage

**Route:** `/register`

**Purpose:** Teacher/Admin registration (NOT student - students use join flow)

**UI Components:**
```
┌─────────────────────────────────────────┐
│  ProximaNav (minimal)                   │
├─────────────────────────────────────────┤
│                                         │
│  Registration Form                      │
│  ┌───────────────────────────────────┐  │
│  │ Full Name                         │  │
│  │ [________________________________]│  │
│  │                                   │  │
│  │ Email                             │  │
│  │ [________________________________]│  │
│  │                                   │  │
│  │ Password                          │  │
│  │ [________________________________]│  │
│  │                                   │  │
│  │ Confirm Password                  │  │
│  │ [________________________________]│  │
│  │                                   │  │
│  │ Role                              │  │
│  │ (o) Teacher                       │  │
│  │ ( ) Institution Admin             │  │
│  │                                   │  │
│  │ Institution (if admin)            │  │
│  │ [Select or enter slug]            │  │
│  │                                   │  │
│  │ [Register]                        │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Already have account? [Login]          │
│                                         │
└─────────────────────────────────────────┘
```

**Form Fields:**
- name (required)
- email (required)
- password (required, min 8 chars)
- confirmPassword (must match)
- role (teacher or institution_admin)
- institutionId (optional, for teachers joining existing institution)

**On Submit:**
1. Validate passwords match
2. Call `authAPI.register()`
3. Store token in AuthContext
4. Redirect to `/dashboard`

**Note:** Students do NOT use this page. They use `/join` with a join key.

---

### 4. JoinClassPage

**Route:** `/join`

**Purpose:** Student enrollment via class join key

**UI Components:**
```
┌─────────────────────────────────────────┐
│  ProximaNav (minimal)                   │
├─────────────────────────────────────────┤
│                                         │
│  Join Class                             │
│  ┌───────────────────────────────────┐  │
│  │ Enter Class Join Key              │  │
│  │ [________________________________]│  │
│  │ [Find Class]                      │  │
│  └───────────────────────────────────┘  │
│                                         │
│  (After entering key, show preview)     │
│  ┌───────────────────────────────────┐  │
│  │ Class Preview                     │  │
│  │ Mathematics 101                   │  │
│  │ Subject: Math                     │  │
│  │ Teacher: John Teacher             │  │
│  │ Institution: Test University      │  │
│  │                                   │  │
│  │ Create Your Account               │  │
│  │ Full Name                         │  │
│  │ [________________________________]│  │
│  │ Username                          │  │
│  │ [________________________________]│  │
│  │ Password                          │  │
│  │ [________________________________]│  │
│  │                                   │  │
│  │ [Join Class]                      │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

**Flow:**
1. Student enters join key (e.g., `MAT-2026-ABC1`)
2. Call `classAPI.getByJoinKey()`
3. Show class preview with details
4. Student fills registration form
5. Call `enrollAPI.enroll()`
6. Auto-login and redirect to `/classes/:id` (class feed)

**Form Fields (Step 2):**
- name (required)
- username (required, unique per institution)
- password (required, min 8 chars)

**Validation:**
- Join key format (XXX-YYYY-AAAA)
- Username availability check

---

### 5. DashboardPage

**Route:** `/dashboard`

**Purpose:** Display all classes user is enrolled in or teaches

**UI Components:**
```
┌─────────────────────────────────────────┐
│  ProximaNav (full with user menu)       │
├─────────────────────────────────────────┤
│                                         │
│  Dashboard                              │
│  ┌───────────────────────────────────┐  │
│  │ My Classes                        │  │
│  │                                   │  │
│  │ [Create Class] (teacher only)     │  │
│  │                                   │  │
│  │ ┌─────────┐ ┌─────────┐ ┌───────┐ │  │
│  │ │ Math    │ │ Physics │ │ Chem  │ │  │
│  │ │ 101     │ │ 201     │ │ 101   │ │  │
│  │ │         │ │         │ │       │ │  │
│  │ │ 👨‍🏫 John │ │ 👩‍🏫 Jane │ │ 👨‍🏫 Bob│ │  │
│  │ │ 25 students│ │ 18 stu│ │ 30 st │ │  │
│  │ │         │ │         │ │       │ │  │
│  │ │ [Open]  │ │ [Open]  │ │ [Open]│ │  │
│  │ └─────────┘ └─────────┘ └───────┘ │  │
│  │                                   │  │
│  │ ┌─────────────────────────────┐   │  │
│  │ │ LIVE NOW                    │   │  │
│  │ │ Mathematics 101             │   │  │
│  │ │ [Join Session]              │   │  │
│  │ └─────────────────────────────┘   │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

**Features:**
- Grid of class cards
- Filter by: Teaching / Enrolled
- Live session indicator (if any class has active session)
- "Create Class" button (teacher/institution_admin only)

**Create Class Modal:**
```
┌─────────────────────────────────┐
│ Create New Class                │
├─────────────────────────────────┤
│ Class Name                      │
│ [______________________________]│
│                                 │
│ Subject (optional)              │
│ [______________________________]│
│                                 │
│ Description (optional)          │
│ [______________________________]│
│                                 │
│ [Cancel] [Create]               │
└─────────────────────────────────┘
```

**On Create:**
1. Call `classAPI.create()`
2. Refresh class list
3. Show join key in success toast with copy button

---

### 6. AdminPage

**Route:** `/admin`

**Purpose:** Institution admin dashboard

**UI Components:**
```
┌─────────────────────────────────────────┐
│  ProximaNav (full)                      │
├─────────────────────────────────────────┤
│                                         │
│  Admin Dashboard                        │
│  ┌───────────────────────────────────┐  │
│  │ Institution: Test University      │  │
│  │ Plan: Free                        │  │
│  │                                   │  │
│  │ Quick Stats                       │  │
│  │ ┌────────┐ ┌────────┐ ┌────────┐  │  │
│  │ │ Total  │ │ Total  │ │ Active │  │  │
│  │ │Classes │ │Teachers│ │Students│  │  │
│  │ │   12   │ │    8   │ │  245   │  │  │
│  │ └────────┘ └────────┘ └────────┘  │  │
│  │                                   │  │
│  │ Actions                           │  │
│  │ [Manage Classes] [Manage Teachers]│  │
│  │                                   │  │
│  │ Recent Activity                   │  │
│  │ - New class created: Math 101     │  │
│  │ - Session ended: Physics 201      │  │
│  │ - 15 students enrolled today      │  │
│  └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

**Features:**
- Institution overview
- Statistics
- Quick links to manage classes/teachers
- Recent activity feed

---

### 7. ClassFeedPage

**Route:** `/classes/:id`

**Purpose:** Google Classroom-style feed with announcements, materials, and live session access

**UI Components:**
```
┌─────────────────────────────────────────────────────────┐
│  ProximaNav (full)                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Class Header                                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Mathematics 101                    [Start Live]🔴  │  │
│  │ Subject: Math                       [View Sessions]│  │
│  │ Teacher: John Teacher                              │  │
│  │ Join Key: MAT-2026-ABC1 [📋 Copy]                  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────┬─────────────────────────────┐  │
│  │ Feed (Left 70%)     │ Class Info (Right 30%)      │  │
│  │                     │                             │  │
│  │ ┌─────────────────┐ │ Upcoming Sessions           │  │
│  │ │ Create Post     │ │ ┌─────────────────────────┐ │  │
│  │ │ [What to share?]│ │ │ Math Quiz - Mar 25      │ │  │
│  │ │ [📎 Attach]     │ │ │ Live Lecture - Mar 26   │ │  │
│  │ │ [Post]          │ │ └─────────────────────────┘ │  │
│  │ └─────────────────┘ │                             │  │
│  │                     │ Students (25)               │  │
│  │ Feed Items          │ │ 👤 Jane Student           │  │
│  │ ┌─────────────────┐ │ │ 👤 John Doe               │  │
│  │ │ 📢 Announcement │ │ │ ...                       │  │
│  │ │ Midterm Schedule│ │ │ [View All]                │  │
│  │ │ Mar 17, 10:00   │ │                             │  │
│  │ │ [🗑️] (teacher)  │ │ Class Details               │  │
│  │ └─────────────────┘ │ Subject: Math               │  │
│  │                     │ Description: Intro to...    │  │
│  │ ┌─────────────────┐ │                             │  │
│  │ │ 📄 File         │ │                             │  │
│  │ │ Chapter1.pdf    │ │                             │  │
│  │ │ [⬇️ Download]   │ │                             │  │
│  │ └─────────────────┘ │ │                             │  │
│  │                     │ │                             │  │
│  │ ┌─────────────────┐ │ │                             │  │
│  │ │ 📹 Session Recap│ │ │                             │  │
│  │ │ Live session    │ │ │                             │  │
│  │ │ ended at 2pm    │ │ │                             │  │
│  │ └─────────────────┘ │ │                             │  │
│  │                     │ │                             │  │
│  │ [Load More...]      │ │                             │  │
│  └─────────────────────┴─────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Create Post Modal:**
```
┌─────────────────────────────────┐
│ Create Post                     │
├─────────────────────────────────┤
│ Post Type                       │
│ (o) Announcement  ( ) Note      │
│ ( ) File          ( ) Session   │
│                                 │
│ Title                           │
│ [______________________________]│
│                                 │
│ Body                            │
│ [______________________________]│
│ [______________________________]│
│                                 │
│ Attach File                     │
│ [📎 Choose File] no file chosen │
│                                 │
│ [Cancel] [Post]                 │
└─────────────────────────────────┘
```

**Features:**
- Infinite scroll pagination
- Post types: announcement, note, file, session_recap
- Teacher-only: Create post, Delete post, Start live session
- Student: View only
- Live banner when session is active
- Click on session card → join live session

**Start Live Session Modal:**
```
┌─────────────────────────────────┐
│ Start Live Session              │
├─────────────────────────────────┤
│ Session Title                   │
│ [______________________________]│
│                                 │
│ Schedule for (optional)         │
│ [📅 Select date/time]           │
│                                 │
│ ( ) Start now                   │
│ ( ) Schedule for later          │
│                                 │
│ [Cancel] [Start Session]        │
└─────────────────────────────────┘
```

---

### 8. TeacherRoomPage

**Route:** `/classes/:classId/session/:sessionId/teacher`

**Purpose:** Teacher's live session interface (existing, update for new flow)

**UI Components:**
```
┌─────────────────────────────────────────────────────────┐
│  ProximaNav (minimal, no nav during session)            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Session Header                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Mathematics 101 - Live Lecture                    │  │
│  │ 👥 23 students  │  🔴 LIVE  │  ⏱️ 00:45:32       │  │
│  │ [End Session] [Share]                             │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │                                                 │    │
│  │           Main Video Area                       │    │
│  │        (Teacher's camera + screen share)        │    │
│  │                                                 │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌──────────────┐ ┌─────────────┐ ┌─────────────────┐  │
│  │ Students     │ │ Reactions   │ │ Engagement      │  │
│  │ Grid         │ │ Bar         │ │ Panel           │  │
│  │              │ │             │ │                 │  │
│  │ 👤 Jane 🎤   │ │ 👍 5        │ │ Jane: 95%       │  │
│  │ 👤 John ✋   │ │ 😕 2        │ │ John: 87%       │  │
│  │ 👤 Bob       │ │ ⚡ 1        │ │ Bob: 92%        │  │
│  │ ...          │ │ 🔄 0        │ │ ...             │  │
│  └──────────────┘ └─────────────┘ └─────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ [🎤 Mic] [📹 Cam] [🖐 Hand] [😊 React] [📊 Annot]|   │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Features (Existing + New):**
- LiveKit video grid
- Screen sharing
- All real-time features (reactions, raise hand, annotation)
- Attention detection
- **NEW:** Auto-marks attendance when students join
- **NEW:** Session timer display
- **NEW:** End session posts recap to feed automatically

---

### 9. StudentRoomPage

**Route:** `/classes/:classId/session/:sessionId/student`

**Purpose:** Student's live session interface (existing, update for new flow)

**UI Components:**
```
┌─────────────────────────────────────────────────────────┐
│  ProximaNav (minimal)                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Session Header                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Mathematics 101 - Live Lecture                    │  │
│  │ 👨‍🏫 Teacher: John Teacher  │  🔴 LIVE             │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │                                                 │    │
│  │           Main Video Area                       │    │
│  │        (Teacher's camera + screen share)        │    │
│  │                                                 │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌──────────────┐ ┌─────────────┐ ┌─────────────────┐  │
│  │ Students     │ │ Reactions   │ │ My Engagement   │  │
│  │ List         │ │ Bar         │ │ Score           │  │
│  │              │ │             │ │                 │  │
│  │ 👤 Jane 🎤   │ │ [👍] [😕]   │ │ Your attention: │  │
│  │ 👤 John ✋   │ │ [⚡] [🔄]   │ │      92%        │  │
│  │ You          │ │             │ │                 │  │
│  └──────────────┘ └─────────────┘ └─────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ [🎤 Mic] [📹 Cam] [🖐 Hand] [😊 React]          │   │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Features (Existing + New):**
- LiveKit video (view only, can't share screen)
- All real-time features
- **NEW:** Auto-marks attendance on join
- **NEW:** Shows own engagement score
- Leave session → marks attendance left time

---

## Reusable Components

### 1. ProtectedRoute.tsx

**Purpose:** Auth guard for protected pages

**Props:**
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}
```

**Logic:**
1. Check if user is authenticated
2. If not, redirect to `/`
3. If role check fails, redirect to `/dashboard`
4. Otherwise render children

---

### 2. ProximaNav.tsx

**Purpose:** Top navigation bar

**UI:**
```
┌─────────────────────────────────────────────────────────┐
│ Proxima 🚀  [Dashboard] [My Classes]      👤 John ▼    │
└─────────────────────────────────────────────────────────┘
```

**Dropdown Menu:**
- Profile
- Settings
- Logout

**Variants:**
- Full: With user menu (dashboard, class feed)
- Minimal: No menu (login, join, live session)

---

### 3. FeedItem.tsx

**Purpose:** Display a single feed post

**Props:**
```typescript
interface FeedItemProps {
  item: FeedItem;
  isTeacher: boolean;
  onDelete: (id: number) => void;
}
```

**UI by Type:**

**Announcement:**
```
┌─────────────────────────────────┐
│ 📢 Announcement     [🗑️ Delete] │
│ Midterm Schedule                │
│ The midterm exam will be...     │
│                                 │
│ Posted by John Teacher          │
│ Mar 17, 2026 at 10:00 AM        │
└─────────────────────────────────┘
```

**File:**
```
┌─────────────────────────────────┐
│ 📄 File             [🗑️ Delete] │
│ Chapter1.pdf                    │
│                                 │
│ [⬇️ Download] 2.5 MB            │
│                                 │
│ Posted by John Teacher          │
│ Mar 17, 2026 at 10:00 AM        │
└─────────────────────────────────┘
```

**Session Recap:**
```
┌─────────────────────────────────┐
│ 📹 Session Recap                │
│ Live session ended: Quadratic.. │
│ Live session ended at 2:00 PM   │
│                                 │
│ Posted by John Teacher          │
│ Mar 17, 2026 at 2:00 PM         │
└─────────────────────────────────┘
```

---

### 4. FileUpload.tsx

**Purpose:** File upload with preview

**Props:**
```typescript
interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  acceptedTypes?: string[];
  maxSizeMB?: number;
}
```

**UI:**
```
┌─────────────────────────────────┐
│ Drop file here or click to      │
│ upload                          │
│                                 │
│ Supported: PDF, PNG, JPG, DOC   │
│ Max size: 10MB                  │
└─────────────────────────────────┘
```

**Features:**
- Drag & drop
- Click to browse
- Upload progress indicator
- Success/error toast

---

### 5. SessionCard.tsx

**Purpose:** Display session in feed or list

**Props:**
```typescript
interface SessionCardProps {
  session: Session;
  isLive: boolean;
  onJoin: () => void;
  role: 'teacher' | 'student';
}
```

**UI (Live):**
```
┌─────────────────────────────────┐
│ 🔴 LIVE NOW                     │
│ Mathematics 101                 │
│ Live Lecture: Quadratic Eq.     │
│                                 │
│ Started at 10:00 AM             │
│                                 │
│ [Join Session] 📹               │
└─────────────────────────────────┘
```

**UI (Scheduled):**
```
┌─────────────────────────────────┐
│ 📅 Scheduled                    │
│ Mathematics 101                 │
│ Live Lecture: Calculus          │
│                                 │
│ Mar 25, 2026 at 10:00 AM        │
│                                 │
│ [Set Reminder] 🔔               │
└─────────────────────────────────┘
```

**UI (Ended):**
```
┌─────────────────────────────────┐
│ ✅ Ended                        │
│ Mathematics 101                 │
│ Live Lecture: Algebra           │
│                                 │
│ Ended at 2:00 PM                │
│ Recap posted in feed            │
└─────────────────────────────────┘
```

---

### 6. JoinKeyDisplay.tsx

**Purpose:** Display and copy class join key

**Props:**
```typescript
interface JoinKeyDisplayProps {
  joinKey: string;
  className: string;
}
```

**UI:**
```
┌─────────────────────────────────┐
│ Class Join Key                  │
│                                 │
│ MAT-2026-ABC1  [📋 Copy]        │
│                                 │
│ Share this key with students    │
│ They can join at: proxima.app/join│
└─────────────────────────────────┘
```

**Features:**
- Copy to clipboard
- Toast on copy
- QR code option (future)

---

### 7. StudentList.tsx

**Purpose:** Show enrolled students (teacher view)

**Props:**
```typescript
interface StudentListProps {
  classId: number;
}
```

**UI:**
```
┌─────────────────────────────────┐
│ Students (25)                   │
├─────────────────────────────────┤
│ 👤 Jane Student                 │
│    jane.student@student.proxima │
│ 👤 John Doe                     │
│    john.doe@student.proxima     │
│ ...                             │
│                                 │
│ [View All Students]             │
└─────────────────────────────────┘
```

**Features:**
- Scrollable list
- Click for details (future: attendance history)

---

### 8. UpcomingSessions.tsx

**Purpose:** Widget showing scheduled sessions

**Props:**
```typescript
interface UpcomingSessionsProps {
  classId: number;
}
```

**UI:**
```
┌─────────────────────────────────┐
│ Upcoming Sessions               │
├─────────────────────────────────┤
│ 📅 Mar 25, 10:00 AM             │
│    Math Quiz                    │
│                                 │
│ 📅 Mar 26, 2:00 PM              │
│    Live Lecture: Calculus       │
│                                 │
│ [View All Sessions]             │
└─────────────────────────────────┘
```

---

### 9. AttendanceReport.tsx

**Purpose:** Display attendance for a session

**Props:**
```typescript
interface AttendanceReportProps {
  sessionId: number;
}
```

**UI:**
```
┌─────────────────────────────────┐
│ Attendance Report               │
│ Session: Quadratic Equations    │
│                                 │
│ Summary                         │
│ Present: 20/25 (80%)            │
│                                 │
│ Student List                    │
│ ┌─────────────────────────────┐ │
│ │ Name        │ Time  │ Dur   │ │
│ ├─────────────┼───────┼───────┤ │
│ │ Jane S.     │ 10:00 │ 45m   │ │
│ │ John D.     │ 10:02 │ 43m   │ │
│ │ Bob M.      │ 10:05 │ 40m   │ │
│ │ ...         │ ...   │ ...   │ │
│ └─────────────┴───────┴───────┘ │
│                                 │
│ [Export CSV] [Print]            │
└─────────────────────────────────┘
```

---

## Hooks

### 1. `useAuth.ts`

**Purpose:** Auth state and actions

```typescript
const { user, token, isAuthenticated, isLoading, login, register, logout, checkAuth } = useAuth();
```

---

### 2. `useSocket.ts`

**Purpose:** Socket connection and events

```typescript
const { isConnected, socket, emit, on, off } = useSocket();
```

---

### 3. `useAttendance.ts`

**Purpose:** Attendance tracking

```typescript
const { markPresent, markLeft, getReport, getClassSessions } = useAttendance();
```

---

### 4. `useFeed.ts`

**Purpose:** Feed operations

```typescript
const { items, loading, error, fetchFeed, createPost, deletePost, hasMore } = useFeed(classId);
```

---

## Implementation Order

### Phase 1: Foundation (Day 1-2)

1. ✅ Create `.env` file
2. ✅ Create `api.ts` with all API endpoints
3. ✅ Create `socket.ts` with Socket.IO client
4. Create `AuthContext.tsx`
5. Create `SocketContext.tsx`
6. Create `ProtectedRoute.tsx`
7. Update `routes.tsx` with all routes

### Phase 2: Authentication Pages (Day 3)

1. Update `LoginPage.tsx`
2. Update `RegisterPage.tsx`
3. Create `InstitutionRegisterPage.tsx`
4. Create `JoinClassPage.tsx`

### Phase 3: Dashboard & Classes (Day 4-5)

1. Create `DashboardPage.tsx`
2. Create `AdminPage.tsx`
3. Create `ClassFeedPage.tsx`
4. Create `FeedItem.tsx`
5. Create `FileUpload.tsx`
6. Create `SessionCard.tsx`
7. Create `JoinKeyDisplay.tsx`

### Phase 4: Live Sessions (Day 6)

1. Update `TeacherRoomPage.tsx` (attendance integration)
2. Update `StudentRoomPage.tsx` (attendance integration)
3. Create `AttendanceReport.tsx`
4. Create `StudentList.tsx`
5. Create `UpcomingSessions.tsx`

### Phase 5: Polish & Testing (Day 7)

1. Add loading states
2. Add error handling
3. Add toast notifications
4. Test all flows end-to-end
5. Fix bugs
6. Performance optimization

---

## User Flows

### Flow 1: Institution Onboarding

```
Visit /institution/register
  ↓
Fill institution + admin details
  ↓
Submit → Account created
  ↓
Redirected to /admin
  ↓
Admin can now create classes
```

### Flow 2: Teacher Creates Class

```
Teacher logs in → /dashboard
  ↓
Clicks [Create Class]
  ↓
Fills class details
  ↓
Class created with join key
  ↓
Copy join key and share with students
```

### Flow 3: Student Joins Class

```
Student receives join key (MAT-2026-ABC1)
  ↓
Visits /join
  ↓
Enters join key
  ↓
Sees class preview
  ↓
Creates account (name, username, password)
  ↓
Auto-enrolled and logged in
  ↓
Redirected to /classes/:id (class feed)
```

### Flow 4: Teacher Starts Live Session

```
Teacher opens class feed /classes/:id
  ↓
Clicks [Start Live Session]
  ↓
Enters session title
  ↓
Clicks [Start Now]
  ↓
Session created, status = live
  ↓
All students see LIVE banner
  ↓
Teacher redirected to /classes/:id/session/:sid/teacher
  ↓
Students can join via [Join Session] button
```

### Flow 5: Student Joins Live Session

```
Student sees LIVE banner in class feed
  ↓
Clicks [Join Session]
  ↓
Gets LiveKit token
  ↓
Redirected to /classes/:id/session/:sid/student
  ↓
Auto-marked present (attendance)
  ↓
Participates in session
  ↓
Leaves session → attendance duration recorded
```

### Flow 6: Teacher Ends Session

```
Teacher clicks [End Session]
  ↓
Session status = ended
  ↓
Auto-post recap to class feed
  ↓
Redirected to /classes/:id
  ↓
Can view attendance report
```

---

## API Integration Checklist

| Feature | API Endpoint | Frontend Component | Status |
|---------|-------------|-------------------|--------|
| Institution Register | POST /institutions/register | InstitutionRegisterPage | ⏳ |
| Login | POST /auth/login | LoginPage | ⏳ |
| User Register | POST /auth/register | RegisterPage | ⏳ |
| Join Class | POST /enroll | JoinClassPage | ⏳ |
| Get Classes | GET /classes | DashboardPage | ⏳ |
| Create Class | POST /classes | DashboardPage | ⏳ |
| Get Class Feed | GET /feed/classes/:id | ClassFeedPage | ⏳ |
| Create Post | POST /feed/classes/:id | CreatePost | ⏳ |
| Upload File | POST /upload | FileUpload | ⏳ |
| Create Session | POST /sessions/classes/:id | ClassFeedPage | ⏳ |
| Start Session | POST /sessions/:id/start | ClassFeedPage | ⏳ |
| End Session | POST /sessions/:id/end | TeacherRoomPage | ⏳ |
| Get LiveKit Token | GET /token | Teacher/StudentRoom | ⏳ |
| Mark Attendance | POST /attendance/:id/mark | Socket (auto) | ⏳ |
| Get Attendance | GET /attendance/:id/report | AttendanceReport | ⏳ |

---

## Notes

1. **All timestamps** should be displayed in user's local timezone
2. **File uploads** are stored locally in development, S3 in production
3. **Socket connection** should persist across page navigation
4. **Attendance** is automatically tracked via socket events
5. **Session recaps** are auto-posted when session ends
6. **Join keys** never expire unless explicitly reset
7. **Role-based UI** - show/hide elements based on user role
8. **Responsive design** - all pages must work on mobile

---

## Next Steps

1. Review this document
2. Start with Phase 1 (Foundation)
3. Implement pages in order
4. Test each flow as you complete it
5. Iterate and polish
