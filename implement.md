# Proxima — Complete Implementation Guide

Everything required to build the full platform from scratch.
Follow in order. Each section depends on the previous one.

---

## Prerequisites

```
Node.js 18 or above
Docker and docker-compose
Git
A code editor
```

Verify:

```
node --version
docker --version
docker-compose --version
```

---

## Repository Structure

```
proxima/
├── server/
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   ├── .env
│   ├── .env.example
│   ├── uploads/                    teacher file uploads live here
│   └── src/
│       ├── routes/
│       │   ├── auth.js
│       │   ├── token.js
│       │   ├── rooms.js
│       │   ├── institutions.js     new
│       │   ├── classes.js          new
│       │   ├── feed.js             new
│       │   ├── sessions.js         new
│       │   ├── enroll.js           new
│       │   └── upload.js           new
│       ├── middleware/
│       │   ├── authenticate.js
│       │   └── tenantScope.js      new
│       ├── socket/
│       │   └── index.js
│       ├── store/
│       │   └── index.js
│       └── db/
│           ├── index.js            new (Prisma client)
│           └── seed.js             new (optional demo data)
├── client/
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   ├── .env
│   └── src/
│       ├── main.tsx
│       ├── api.ts                  new
│       ├── socket.ts
│       ├── App.tsx
│       ├── context/
│       │   ├── AuthContext.tsx     new
│       │   └── RoomContext.tsx     new
│       ├── hooks/
│       │   ├── useAuth.ts          new
│       │   └── useRoom.ts          new
│       └── app/
│           ├── routes.tsx
│           ├── components/
│           │   ├── ProximaNav.tsx
│           │   ├── ProtectedRoute.tsx  new
│           │   ├── ReactionBar.tsx
│           │   ├── AnnotationCanvas.tsx
│           │   ├── EngagementPanel.tsx
│           │   ├── AttentionDetector.tsx
│           │   ├── FeedItem.tsx        new
│           │   └── FileUpload.tsx      new
│           └── pages/
│               ├── LoginPage.tsx
│               ├── RegisterPage.tsx
│               ├── JoinPage.tsx        new
│               ├── DashboardPage.tsx
│               ├── ClassFeedPage.tsx   new
│               ├── TeacherRoomPage.tsx
│               ├── StudentRoomPage.tsx
│               └── AdminPage.tsx       new
├── docker-compose.yml
├── livekit.yaml
├── prisma/
│   └── schema.prisma               new
└── README.md
```

---

## Part 1 — Infrastructure Setup

### docker-compose.yml

This runs PostgreSQL and Livekit together.
Backend runs separately so nodemon works during development.

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: proxima
      POSTGRES_USER: proxima
      POSTGRES_PASSWORD: proxima_secret
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  livekit:
    image: livekit/livekit-server:latest
    ports:
      - "7880:7880"
      - "7881:7881"
      - "7882:7882/udp"
    volumes:
      - ./livekit.yaml:/livekit.yaml
    command: --config /livekit.yaml
    restart: unless-stopped

volumes:
  postgres_data:
```

### livekit.yaml

```yaml
port: 7880
rtc:
  tcp_port: 7881
  udp_port: 7882
  use_external_ip: false
  node_ip: 127.0.0.1

keys:
  devkey: secret

logging:
  json: false
  level: info
```

Replace node_ip with your actual local IP when testing
across devices on the same network.

Start everything:

```
docker-compose up -d
```

Verify postgres is running:

```
docker-compose logs postgres
```

Should show: database system is ready to accept connections

---

## Part 2 — Database with Prisma

### Install Prisma

```
cd server
npm install prisma @prisma/client
npx prisma init
```

This creates a prisma/ folder and a .env with DATABASE_URL.

### server/.env

```
DATABASE_URL=postgresql://proxima:proxima_secret@localhost:5432/proxima
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
LIVEKIT_HOST=ws://localhost:7880
PORT=3001
CLIENT_URL=http://localhost:5173
JWT_SECRET=proxima_super_secret_jwt_key_2026
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10
```

### prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Institution {
  id         Int      @id @default(autoincrement())
  name       String
  slug       String   @unique
  adminEmail String
  plan       String   @default("free")
  createdAt  DateTime @default(now())

  users        User[]
  classes      Class[]
}

model User {
  id            Int          @id @default(autoincrement())
  institutionId Int?
  name          String
  email         String
  password      String
  role          String
  username      String?
  createdAt     DateTime     @default(now())

  institution   Institution? @relation(fields: [institutionId], references: [id])
  taughtClasses Class[]      @relation("TeacherClasses")
  enrollments   Enrollment[]
  feedItems     FeedItem[]
  sessions      LiveSession[]

  @@unique([institutionId, email])
  @@unique([institutionId, username])
}

model Class {
  id            Int      @id @default(autoincrement())
  institutionId Int
  teacherId     Int
  name          String
  subject       String?
  description   String?
  joinKey       String   @unique
  createdAt     DateTime @default(now())

  institution   Institution  @relation(fields: [institutionId], references: [id])
  teacher       User         @relation("TeacherClasses", fields: [teacherId], references: [id])
  enrollments   Enrollment[]
  feedItems     FeedItem[]
  sessions      LiveSession[]
}

model Enrollment {
  id        Int      @id @default(autoincrement())
  classId   Int
  studentId Int
  joinedAt  DateTime @default(now())

  class     Class    @relation(fields: [classId], references: [id])
  student   User     @relation(fields: [studentId], references: [id])

  @@unique([classId, studentId])
}

model FeedItem {
  id        Int      @id @default(autoincrement())
  classId   Int
  authorId  Int
  type      String
  title     String?
  body      String?
  fileUrl   String?
  fileName  String?
  createdAt DateTime @default(now())

  class     Class    @relation(fields: [classId], references: [id])
  author    User     @relation(fields: [authorId], references: [id])
}

model LiveSession {
  id           Int       @id @default(autoincrement())
  classId      Int
  teacherId    Int
  title        String
  scheduledAt  DateTime?
  startedAt    DateTime?
  endedAt      DateTime?
  livekitRoom  String?
  status       String    @default("scheduled")
  createdAt    DateTime  @default(now())

  class        Class     @relation(fields: [classId], references: [id])
  teacher      User      @relation(fields: [teacherId], references: [id])
}
```

### Run the migration

```
npx prisma migrate dev --name init
npx prisma generate
```

Verify tables were created:

```
npx prisma studio
```

Opens a browser UI at localhost:5555 showing all tables.

### server/src/db/index.js

```js
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error"] : [],
});

module.exports = prisma;
```

---

## Part 3 — Backend

### Install all dependencies

```
cd server
npm install express socket.io cors dotenv
npm install livekit-server-sdk
npm install bcryptjs jsonwebtoken
npm install multer
npm install prisma @prisma/client
npm install -D nodemon
```

### server/server.js

```js
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/auth", require("./src/routes/auth"));
app.use(
  "/token",
  require("./src/middleware/authenticate"),
  require("./src/routes/token"),
);
app.use("/rooms", require("./src/routes/rooms"));
app.use("/institutions", require("./src/routes/institutions"));
app.use(
  "/classes",
  require("./src/middleware/authenticate"),
  require("./src/routes/classes"),
);
app.use(
  "/feed",
  require("./src/middleware/authenticate"),
  require("./src/routes/feed"),
);
app.use(
  "/sessions",
  require("./src/middleware/authenticate"),
  require("./src/routes/sessions"),
);
app.use("/enroll", require("./src/routes/enroll"));
app.use(
  "/upload",
  require("./src/middleware/authenticate"),
  require("./src/routes/upload"),
);

io.on("connection", (socket) => {
  require("./src/socket")(io, socket);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Proxima backend running on http://localhost:${PORT}`);
});
```

### server/src/middleware/authenticate.js

```js
const jwt = require("jsonwebtoken");

module.exports = function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header missing" });
  }
  try {
    req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
```

### server/src/middleware/tenantScope.js

```js
module.exports = function tenantScope(req, res, next) {
  if (!req.user?.institutionId) {
    return res.status(403).json({ error: "No institution scope on token" });
  }
  req.institutionId = req.user.institutionId;
  next();
};
```

### server/src/routes/auth.js

```js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../db");
const router = express.Router();

const signToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "6h" },
  );

router.post("/register", async (req, res) => {
  const { name, email, password, role, institutionId } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields required" });
  }
  const existing = await prisma.user.findFirst({
    where: { email, institutionId: institutionId || null },
  });
  if (existing)
    return res.status(409).json({ error: "Email already registered" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role,
      institutionId: institutionId || null,
    },
  });
  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token: signToken(user),
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "All fields required" });

  const user = await prisma.user.findFirst({ where: { email } });
  if (!user)
    return res.status(401).json({ error: "Invalid email or password" });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(401).json({ error: "Invalid email or password" });

  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token: signToken(user),
  });
});

router.get("/me", require("../middleware/authenticate"), async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

module.exports = router;
```

### server/src/routes/token.js

```js
const express = require("express");
const { AccessToken } = require("livekit-server-sdk");
const prisma = require("../db");
const router = express.Router();

router.get("/", async (req, res) => {
  const { session_id, room, name, role } = req.query;

  let livekitRoom = room;

  if (session_id) {
    const session = await prisma.liveSession.findUnique({
      where: { id: parseInt(session_id) },
      include: { class: { include: { enrollments: true } } },
    });
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.status !== "live")
      return res.status(400).json({ error: "Session is not live" });

    const isTeacher = session.teacherId === req.user.id;
    const isStudent = session.class.enrollments.some(
      (e) => e.studentId === req.user.id,
    );
    if (!isTeacher && !isStudent) {
      return res.status(403).json({ error: "Not enrolled in this class" });
    }
    livekitRoom = session.livekitRoom;
  }

  if (!livekitRoom)
    return res.status(400).json({ error: "room or session_id required" });

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    { identity: req.user.name, ttl: "6h" },
  );
  at.addGrant({
    roomJoin: true,
    room: livekitRoom,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    roomAdmin: role === "teacher",
  });

  res.json({ token: await at.toJwt(), serverUrl: process.env.LIVEKIT_HOST });
});

module.exports = router;
```

### server/src/routes/institutions.js

```js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../db");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { institutionName, slug, adminName, adminEmail, adminPassword } =
    req.body;
  if (
    !institutionName ||
    !slug ||
    !adminName ||
    !adminEmail ||
    !adminPassword
  ) {
    return res.status(400).json({ error: "All fields required" });
  }
  const existing = await prisma.institution.findUnique({ where: { slug } });
  if (existing) return res.status(409).json({ error: "Slug already taken" });

  const institution = await prisma.institution.create({
    data: { name: institutionName, slug, adminEmail },
  });
  const hashed = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      password: hashed,
      role: "institution_admin",
      institutionId: institution.id,
    },
  });
  const token = jwt.sign(
    {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      institutionId: institution.id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "6h" },
  );
  res.status(201).json({ institution, user: admin, token });
});

router.get("/:slug", async (req, res) => {
  const institution = await prisma.institution.findUnique({
    where: { slug: req.params.slug },
  });
  if (!institution)
    return res.status(404).json({ error: "Institution not found" });
  res.json({ institution });
});

module.exports = router;
```

### server/src/routes/classes.js

```js
const express = require("express");
const prisma = require("../db");
const router = express.Router();

const generateJoinKey = (subject) => {
  const prefix = (subject || "CLS").substring(0, 3).toUpperCase();
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${year}-${random}`;
};

router.post("/", async (req, res) => {
  if (!["teacher", "institution_admin"].includes(req.user.role)) {
    return res.status(403).json({ error: "Only teachers can create classes" });
  }
  const { name, subject, description } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });

  const cls = await prisma.class.create({
    data: {
      name,
      subject,
      description,
      joinKey: generateJoinKey(subject),
      institutionId: req.user.institutionId,
      teacherId: req.user.id,
    },
  });
  res.status(201).json({ class: cls });
});

router.get("/", async (req, res) => {
  let classes;
  if (req.user.role === "teacher") {
    classes = await prisma.class.findMany({
      where: { teacherId: req.user.id },
      include: {
        enrollments: true,
        sessions: { orderBy: { scheduledAt: "desc" }, take: 1 },
      },
    });
  } else {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: req.user.id },
      include: {
        class: {
          include: { teacher: { select: { name: true } }, enrollments: true },
        },
      },
    });
    classes = enrollments.map((e) => e.class);
  }
  res.json({ classes });
});

router.get("/:classId", async (req, res) => {
  const cls = await prisma.class.findUnique({
    where: { id: parseInt(req.params.classId) },
    include: {
      teacher: { select: { name: true, email: true } },
      enrollments: true,
    },
  });
  if (!cls) return res.status(404).json({ error: "Class not found" });
  res.json({ class: cls });
});

router.get("/join/:joinKey", async (req, res) => {
  const cls = await prisma.class.findUnique({
    where: { joinKey: req.params.joinKey },
    include: {
      teacher: { select: { name: true } },
      institution: { select: { name: true } },
    },
  });
  if (!cls) return res.status(404).json({ error: "Invalid join key" });
  res.json({
    className: cls.name,
    subject: cls.subject,
    teacherName: cls.teacher.name,
    institutionName: cls.institution?.name,
    classId: cls.id,
  });
});

module.exports = router;
```

### server/src/routes/enroll.js

```js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../db");
const router = express.Router();

router.post("/", async (req, res) => {
  const { joinKey, name, username, password } = req.body;
  if (!joinKey || !name || !username || !password) {
    return res.status(400).json({ error: "All fields required" });
  }
  const cls = await prisma.class.findUnique({
    where: { joinKey },
  });
  if (!cls) return res.status(404).json({ error: "Invalid join key" });

  const existing = await prisma.user.findFirst({
    where: { username, institutionId: cls.institutionId },
  });
  if (existing)
    return res
      .status(409)
      .json({ error: "Username taken in this institution" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      username,
      email: `${username}@student.proxima`,
      password: hashed,
      role: "student",
      institutionId: cls.institutionId,
    },
  });
  await prisma.enrollment.create({
    data: { classId: cls.id, studentId: user.id },
  });
  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "6h" },
  );
  res.status(201).json({ user, token, classId: cls.id });
});

module.exports = router;
```

### server/src/routes/feed.js

```js
const express = require("express");
const prisma = require("../db");
const router = express.Router();

router.get("/classes/:classId", async (req, res) => {
  const classId = parseInt(req.params.classId);
  const page = parseInt(req.query.page || "1");
  const limit = parseInt(req.query.limit || "20");

  const [items, total] = await Promise.all([
    prisma.feedItem.findMany({
      where: { classId },
      include: { author: { select: { name: true, role: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.feedItem.count({ where: { classId } }),
  ]);
  res.json({ items, total, page });
});

router.post("/classes/:classId", async (req, res) => {
  if (!["teacher", "institution_admin"].includes(req.user.role)) {
    return res.status(403).json({ error: "Only teachers can post to feed" });
  }
  const { type, title, body, fileUrl, fileName } = req.body;
  if (!type) return res.status(400).json({ error: "type is required" });

  const item = await prisma.feedItem.create({
    data: {
      classId: parseInt(req.params.classId),
      authorId: req.user.id,
      type,
      title,
      body,
      fileUrl,
      fileName,
    },
    include: { author: { select: { name: true, role: true } } },
  });
  res.status(201).json({ item });
});

router.delete("/:itemId", async (req, res) => {
  const item = await prisma.feedItem.findUnique({
    where: { id: parseInt(req.params.itemId) },
  });
  if (!item) return res.status(404).json({ error: "Item not found" });
  if (item.authorId !== req.user.id) {
    return res.status(403).json({ error: "Not your post" });
  }
  await prisma.feedItem.delete({ where: { id: item.id } });
  res.json({ deleted: true });
});

module.exports = router;
```

### server/src/routes/sessions.js

```js
const express = require("express");
const { RoomServiceClient, AccessToken } = require("livekit-server-sdk");
const prisma = require("../db");
const router = express.Router();

const roomService = new RoomServiceClient(
  process.env.LIVEKIT_HOST?.replace("ws://", "http://").replace(
    "wss://",
    "https://",
  ),
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET,
);

router.post("/classes/:classId", async (req, res) => {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ error: "Only teachers can create sessions" });
  }
  const { title, scheduledAt } = req.body;
  if (!title) return res.status(400).json({ error: "title is required" });

  const session = await prisma.liveSession.create({
    data: {
      classId: parseInt(req.params.classId),
      teacherId: req.user.id,
      title,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      status: "scheduled",
    },
  });
  res.status(201).json({ session });
});

router.post("/:sessionId/start", async (req, res) => {
  const session = await prisma.liveSession.findUnique({
    where: { id: parseInt(req.params.sessionId) },
  });
  if (!session) return res.status(404).json({ error: "Session not found" });
  if (session.teacherId !== req.user.id) {
    return res.status(403).json({ error: "Not your session" });
  }

  const livekitRoom = `session_${session.id}_${Date.now()}`;

  try {
    await roomService.createRoom({ name: livekitRoom, emptyTimeout: 300 });
  } catch {
    // Room creation is best-effort
  }

  const updated = await prisma.liveSession.update({
    where: { id: session.id },
    data: { status: "live", startedAt: new Date(), livekitRoom },
  });
  res.json({ session: updated });
});

router.post("/:sessionId/end", async (req, res) => {
  const session = await prisma.liveSession.findUnique({
    where: { id: parseInt(req.params.sessionId) },
  });
  if (!session) return res.status(404).json({ error: "Session not found" });
  if (session.teacherId !== req.user.id) {
    return res.status(403).json({ error: "Not your session" });
  }

  const updated = await prisma.liveSession.update({
    where: { id: session.id },
    data: { status: "ended", endedAt: new Date() },
  });

  // Auto-post session recap to class feed
  await prisma.feedItem.create({
    data: {
      classId: session.classId,
      authorId: session.teacherId,
      type: "session_recap",
      title: `Session ended: ${session.title}`,
      body: `Live session ended at ${new Date().toLocaleTimeString()}`,
    },
  });

  res.json({ session: updated });
});

router.get("/classes/:classId", async (req, res) => {
  const sessions = await prisma.liveSession.findMany({
    where: { classId: parseInt(req.params.classId) },
    orderBy: { createdAt: "desc" },
  });
  res.json({ sessions });
});

module.exports = router;
```

### server/src/routes/upload.js

```js
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

const uploadDir = process.env.UPLOAD_DIR || "./uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || "10") * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      ".pdf",
      ".png",
      ".jpg",
      ".jpeg",
      ".doc",
      ".docx",
      ".ppt",
      ".pptx",
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("File type not allowed"));
  },
});

router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  res.json({
    url: `/uploads/${req.file.filename}`,
    fileName: req.file.originalname,
    fileSize: req.file.size,
  });
});

module.exports = router;
```

---

## Part 4 — Frontend

### Install dependencies

```
cd client
npm install @livekit/components-react @livekit/components-styles livekit-client
npm install socket.io-client
npm install face-api.js
npm install react-router-dom
```

### client/.env

```
VITE_API_URL=http://localhost:3001
VITE_LIVEKIT_URL=ws://localhost:7880
```

### client/src/socket.ts

```ts
import { io } from "socket.io-client";
const URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
export const socket = io(URL, { autoConnect: false });
```

### client/src/api.ts

```ts
const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const getToken = () => localStorage.getItem("proxima_token") || "";

const headers = (extra: Record<string, string> = {}) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
  ...extra,
});

export const api = {
  get: (path: string) =>
    fetch(`${BASE}${path}`, { headers: headers() }).then((r) => r.json()),

  post: (path: string, body: object) =>
    fetch(`${BASE}${path}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  delete: (path: string) =>
    fetch(`${BASE}${path}`, {
      method: "DELETE",
      headers: headers(),
    }).then((r) => r.json()),

  upload: (path: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: form,
    }).then((r) => r.json());
  },
};
```

### client/src/context/AuthContext.tsx

```tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "../api";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  institutionId: number | null;
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    role: string,
  ) => Promise<{ error?: string }>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("proxima_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((d) => {
        if (d.user) {
          setUser(d.user);
          localStorage.setItem("proxima_user", JSON.stringify(d.user));
        } else {
          localStorage.removeItem("proxima_token");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const d = await api.post("/auth/login", { email, password });
    if (d.error) return { error: d.error };
    localStorage.setItem("proxima_token", d.token);
    localStorage.setItem("proxima_user", JSON.stringify(d.user));
    setUser(d.user);
    return {};
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: string,
  ) => {
    const d = await api.post("/auth/register", { name, email, password, role });
    if (d.error) return { error: d.error };
    localStorage.setItem("proxima_token", d.token);
    localStorage.setItem("proxima_user", JSON.stringify(d.user));
    setUser(d.user);
    return {};
  };

  const logout = () => {
    localStorage.removeItem("proxima_token");
    localStorage.removeItem("proxima_user");
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
```

### client/src/app/components/ProtectedRoute.tsx

```tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}
```

### client/src/app/routes.tsx

```tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import JoinPage from "./pages/JoinPage";
import DashboardPage from "./pages/DashboardPage";
import ClassFeedPage from "./pages/ClassFeedPage";
import TeacherRoomPage from "./pages/TeacherRoomPage";
import StudentRoomPage from "./pages/StudentRoomPage";
import AdminPage from "./pages/AdminPage";

const P = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

export const router = createBrowserRouter([
  { path: "/", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/join/:joinKey", element: <JoinPage /> },
  {
    path: "/dashboard",
    element: (
      <P>
        <DashboardPage />
      </P>
    ),
  },
  {
    path: "/classes/:classId",
    element: (
      <P>
        <ClassFeedPage />
      </P>
    ),
  },
  {
    path: "/classes/:classId/teacher",
    element: (
      <P>
        <TeacherRoomPage />
      </P>
    ),
  },
  {
    path: "/classes/:classId/student",
    element: (
      <P>
        <StudentRoomPage />
      </P>
    ),
  },
  {
    path: "/admin",
    element: (
      <P>
        <AdminPage />
      </P>
    ),
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
```

### client/src/main.tsx

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { router } from "./app/routes";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);
```

### client/src/app/pages/JoinPage.tsx

Student lands here from a join key link.
Creates account and gets enrolled automatically.

```tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api";

export default function JoinPage() {
  const { joinKey } = useParams();
  const navigate = useNavigate();
  const [preview, setPreview] = useState<any>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/classes/join/${joinKey}`).then((d) => {
      if (!d.error) setPreview(d);
    });
  }, [joinKey]);

  const handleJoin = async () => {
    setLoading(true);
    const d = await api.post("/enroll", { joinKey, name, username, password });
    if (d.error) {
      setError(d.error);
      setLoading(false);
      return;
    }
    localStorage.setItem("proxima_token", d.token);
    localStorage.setItem("proxima_user", JSON.stringify(d.user));
    navigate(`/classes/${d.classId}`);
  };

  return (
    <div>
      {preview && (
        <div>
          <h2>Join {preview.className}</h2>
          <p>Teacher: {preview.teacherName}</p>
          <p>Institution: {preview.institutionName}</p>
        </div>
      )}
      <input
        placeholder="Your full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Choose username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="Set password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleJoin} disabled={loading}>
        {loading ? "Joining..." : "Join Class"}
      </button>
    </div>
  );
}
```

### client/src/app/pages/ClassFeedPage.tsx

Core page. Shows feed, allows teacher to post, shows live session banner.

```tsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";

export default function ClassFeedPage() {
  const { classId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cls, setCls] = useState<any>(null);
  const [feed, setFeed] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [postBody, setPostBody] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get(`/classes/${classId}`).then((d) => setCls(d.class));
    api.get(`/feed/classes/${classId}`).then((d) => setFeed(d.items || []));
    api
      .get(`/sessions/classes/${classId}`)
      .then((d) => setSessions(d.sessions || []));
  }, [classId]);

  const postAnnouncement = async () => {
    if (!postBody.trim()) return;
    const d = await api.post(`/feed/classes/${classId}`, {
      type: "announcement",
      title: postTitle,
      body: postBody,
    });
    if (!d.error) {
      setFeed((prev) => [d.item, ...prev]);
      setPostBody("");
      setPostTitle("");
    }
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const upload = await api.upload("/upload", file);
    if (upload.url) {
      const d = await api.post(`/feed/classes/${classId}`, {
        type: "file",
        title: file.name,
        fileUrl: upload.url,
        fileName: upload.fileName,
      });
      if (!d.error) setFeed((prev) => [d.item, ...prev]);
    }
  };

  const startSession = async () => {
    const created = await api.post(`/sessions/classes/${classId}`, {
      title: `Live Session — ${new Date().toLocaleDateString()}`,
    });
    if (created.session) {
      const started = await api.post(
        `/sessions/${created.session.id}/start`,
        {},
      );
      if (started.session) {
        navigate(`/classes/${classId}/teacher`);
      }
    }
  };

  const liveSession = sessions.find((s) => s.status === "live");

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      {cls && (
        <div>
          <h1>{cls.name}</h1>
          <p>{cls.subject}</p>
          {user?.role === "teacher" && (
            <p>
              Join Key: <strong>{cls.joinKey}</strong>
            </p>
          )}
        </div>
      )}

      {liveSession && (
        <div
          style={{
            background: "#00C851",
            border: "2px solid #000",
            padding: 16,
            marginBottom: 16,
          }}
        >
          <strong>LIVE NOW: {liveSession.title}</strong>
          <button onClick={() => navigate(`/classes/${classId}/student`)}>
            Join Session
          </button>
        </div>
      )}

      {user?.role === "teacher" && (
        <div
          style={{ border: "2px solid #000", padding: 16, marginBottom: 24 }}
        >
          <input
            placeholder="Announcement title (optional)"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            style={{ width: "100%", marginBottom: 8 }}
          />
          <textarea
            placeholder="Write an announcement..."
            value={postBody}
            onChange={(e) => setPostBody(e.target.value)}
            style={{ width: "100%", height: 80 }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={postAnnouncement}>Post</button>
            <button onClick={() => fileRef.current?.click()}>
              Upload File
            </button>
            <button
              onClick={startSession}
              style={{ marginLeft: "auto", background: "#FF6B35" }}
            >
              Start Live Session
            </button>
          </div>
          <input ref={fileRef} type="file" hidden onChange={uploadFile} />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {feed.map((item) => (
          <div key={item.id} style={{ border: "2px solid #000", padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{item.author?.name}</strong>
              <small>{new Date(item.createdAt).toLocaleDateString()}</small>
            </div>
            {item.title && <h3 style={{ marginTop: 8 }}>{item.title}</h3>}
            {item.body && <p style={{ marginTop: 4 }}>{item.body}</p>}
            {item.type === "file" && (
              <a
                href={`${import.meta.env.VITE_API_URL}${item.fileUrl}`}
                target="_blank"
                rel="noreferrer"
              >
                Download: {item.fileName}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### client/src/app/pages/TeacherRoomPage.tsx

```tsx
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  LiveKitRoom,
  VideoConference,
  useRoomContext,
  useScreenShare,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { socket } from "../../socket";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
const LK = import.meta.env.VITE_LIVEKIT_URL || "ws://localhost:7880";

function TeacherInner({ roomId }: { roomId: string }) {
  const room = useRoomContext();

  useEffect(() => {
    const onData = (payload: Uint8Array) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload));
        if (msg.type === "reaction") {
          socket.emit("student_reaction", {
            roomId,
            studentName: msg.from,
            type: msg.reaction,
          });
        }
      } catch {}
    };
    room.on("dataReceived", onData);
    return () => {
      room.off("dataReceived", onData);
    };
  }, [room, roomId]);

  return <VideoConference />;
}

export default function TeacherRoomPage() {
  const { classId } = useParams();
  const [token, setToken] = useState("");
  const [reactions, setReactions] = useState({
    got_it: 0,
    confused: 0,
    too_fast: 0,
    repeat: 0,
  });
  const [attention, setAttention] = useState<Record<string, number>>({});
  const [hands, setHands] = useState<string[]>([]);

  const user = JSON.parse(localStorage.getItem("proxima_user") || "{}");

  const fetchToken = useCallback(async (room: string) => {
    const authToken = localStorage.getItem("proxima_token");
    const res = await fetch(`${API}/token?room=${room}&role=teacher`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const data = await res.json();
    setToken(data.token);
  }, []);

  useEffect(() => {
    const room = `class_${classId}_${Date.now()}`;
    fetchToken(room);

    socket.connect();
    socket.emit("join_room", {
      roomId: room,
      name: user.name,
      role: "teacher",
    });

    socket.on("reaction_update", ({ counts }) => setReactions({ ...counts }));
    socket.on("attention_update", ({ studentName, score }) =>
      setAttention((p) => ({ ...p, [studentName]: score })),
    );
    socket.on("hand_raised", ({ studentName }) =>
      setHands((p) => [...new Set([...p, studentName])]),
    );
    socket.on("hand_lowered", ({ studentName }) =>
      setHands((p) => p.filter((s) => s !== studentName)),
    );

    return () => {
      socket.off("reaction_update");
      socket.off("attention_update");
      socket.off("hand_raised");
      socket.off("hand_lowered");
      socket.disconnect();
    };
  }, [classId, fetchToken, user.name]);

  if (!token) return <div style={{ padding: 40 }}>Connecting...</div>;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1 }}>
        <LiveKitRoom
          token={token}
          serverUrl={LK}
          connect
          video
          audio
          style={{ height: "100%" }}
        >
          <TeacherInner roomId={`class_${classId}`} />
        </LiveKitRoom>
      </div>
      <div
        style={{
          width: 260,
          borderLeft: "2px solid #000",
          padding: 16,
          overflowY: "auto",
        }}
      >
        <h3>Reactions</h3>
        {Object.entries(reactions).map(([k, v]) => (
          <div
            key={k}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
            }}
          >
            <span>{k.replace("_", " ")}</span>
            <strong>{v}</strong>
          </div>
        ))}
        <hr style={{ border: "2px solid #000", margin: "16px 0" }} />
        <h3>Engagement</h3>
        {Object.entries(attention).map(([name, score]) => (
          <div key={name} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{name}</span>
              <span
                style={{
                  color:
                    score > 70 ? "#00C851" : score > 40 ? "#FF6B35" : "#FF3D57",
                }}
              >
                {Math.round(score)}%
              </span>
            </div>
            <div
              style={{
                height: 6,
                background: "#eee",
                border: "1px solid #000",
                marginTop: 4,
              }}
            >
              <div
                style={{
                  width: `${score}%`,
                  height: "100%",
                  background:
                    score > 70 ? "#00C851" : score > 40 ? "#FF6B35" : "#FF3D57",
                }}
              />
            </div>
          </div>
        ))}
        {hands.length > 0 && (
          <>
            <hr style={{ border: "2px solid #000", margin: "16px 0" }} />
            <h3>Raised Hands</h3>
            {hands.map((h) => (
              <div key={h} style={{ padding: "4px 0" }}>
                {h}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
```

### client/src/app/pages/StudentRoomPage.tsx

```tsx
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  LiveKitRoom,
  VideoConference,
  useLocalParticipant,
} from "@livekit/components-react";
import { Track, DataPacket_Kind } from "livekit-client";
import "@livekit/components-styles";
import { socket } from "../../socket";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";
const LK = import.meta.env.VITE_LIVEKIT_URL || "ws://localhost:7880";

function StudentInner({ roomId, name }: { roomId: string; name: string }) {
  const { localParticipant } = useLocalParticipant();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hand, setHand] = useState(false);

  useEffect(() => {
    const pub = localParticipant?.getTrackPublication(Track.Source.Camera);
    const track = pub?.videoTrack;
    if (track && videoRef.current) track.attach(videoRef.current);
  }, [localParticipant]);

  const sendReaction = async (type: string) => {
    if (!localParticipant) return;
    const data = new TextEncoder().encode(
      JSON.stringify({ type: "reaction", reaction: type, from: name }),
    );
    await localParticipant.publishData(data, DataPacket_Kind.RELIABLE);
    socket.emit("student_reaction", { roomId, studentName: name, type });
  };

  const toggleHand = () => {
    const next = !hand;
    setHand(next);
    socket.emit(next ? "raise_hand" : "lower_hand", {
      roomId,
      studentName: name,
    });
  };

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <VideoConference />
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "10px 16px",
          background: "#fff",
          borderTop: "2px solid #000",
          display: "flex",
          gap: 8,
        }}
      >
        {["got_it", "confused", "too_fast", "repeat"].map((type) => (
          <button
            key={type}
            onClick={() => sendReaction(type)}
            style={{
              padding: "8px 14px",
              border: "2px solid #000",
              boxShadow: "3px 3px 0 #000",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {type.replace("_", " ")}
          </button>
        ))}
        <button
          onClick={toggleHand}
          style={{
            marginLeft: "auto",
            padding: "8px 14px",
            background: hand ? "#FFD600" : "#fff",
            border: "2px solid #000",
            boxShadow: "3px 3px 0 #000",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {hand ? "Lower Hand" : "Raise Hand"}
        </button>
      </div>
    </div>
  );
}

export default function StudentRoomPage() {
  const { classId } = useParams();
  const [token, setToken] = useState("");
  const user = JSON.parse(localStorage.getItem("proxima_user") || "{}");

  useEffect(() => {
    const authToken = localStorage.getItem("proxima_token");
    const room = `class_${classId}`;
    fetch(`${API}/token?room=${room}&role=student`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then((r) => r.json())
      .then((d) => setToken(d.token));

    socket.connect();
    socket.emit("join_room", {
      roomId: room,
      name: user.name,
      role: "student",
    });
    return () => {
      socket.disconnect();
    };
  }, [classId, user.name]);

  if (!token) return <div style={{ padding: 40 }}>Joining...</div>;

  return (
    <div style={{ height: "100vh" }}>
      <LiveKitRoom
        token={token}
        serverUrl={LK}
        connect
        video
        audio
        style={{ height: "100%" }}
      >
        <StudentInner roomId={`class_${classId}`} name={user.name} />
      </LiveKitRoom>
    </div>
  );
}
```

### client/src/app/components/AttentionDetector.tsx

```tsx
import { useEffect, useRef, RefObject } from "react";
import * as faceapi from "face-api.js";
import { socket } from "../../socket";

let modelsLoaded = false;

interface Props {
  videoRef: RefObject<HTMLVideoElement>;
  studentName: string;
  roomId: string;
}

export default function AttentionDetector({
  videoRef,
  studentName,
  roomId,
}: Props) {
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const init = async () => {
      if (!modelsLoaded) {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models"),
          faceapi.nets.faceExpressionNet.loadFromUri("/models"),
        ]);
        modelsLoaded = true;
      }

      intervalRef.current = setInterval(async () => {
        if (!videoRef.current) return;
        try {
          const d = await faceapi
            .detectSingleFace(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions({ inputSize: 160 }),
            )
            .withFaceLandmarks(true)
            .withFaceExpressions();

          let score = 0;
          if (d) {
            const nose = d.landmarks.getNose()[3];
            const chin = d.landmarks.getJawOutline()[8];
            const tilt = Math.abs(nose.x - chin.x);
            score = Math.max(
              0,
              Math.min(100, d.expressions.neutral * 100 - tilt * 0.4),
            );
          }
          socket.emit("attention_score", { studentName, roomId, score });
        } catch {}
      }, 2000);
    };

    init();
    return () => clearInterval(intervalRef.current);
  }, [studentName, roomId]);

  return null;
}
```

Face-api model files go in client/public/models/
Download from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
Files needed:
tiny_face_detector_model-weights_manifest.json
tiny_face_detector_model-shard1
face_landmark_68_tiny_model-weights_manifest.json
face_landmark_68_tiny_model-shard1
face_expression_recognition_model-weights_manifest.json
face_expression_recognition_model-shard1

### client/src/app/components/AnnotationCanvas.tsx

```tsx
import { useEffect, useRef, useState } from "react";
import { socket } from "../../socket";

const COLORS = ["#FF3D57", "#0085FF", "#FFD600"];

export default function AnnotationCanvas({ roomId }: { roomId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const [color, setColor] = useState("#FF3D57");
  const [thickness, setThickness] = useState(2);

  const getPos = (e: React.MouseEvent, canvas: HTMLCanvasElement) => ({
    x: (e.clientX - canvas.getBoundingClientRect().left) / canvas.offsetWidth,
    y: (e.clientY - canvas.getBoundingClientRect().top) / canvas.offsetHeight,
  });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    socket.on("annotation", ({ x0, y0, x1, y1, color: c, thickness: t }) => {
      ctx.beginPath();
      ctx.strokeStyle = c;
      ctx.lineWidth = t;
      ctx.lineCap = "round";
      ctx.moveTo(x0 * canvas.width, y0 * canvas.height);
      ctx.lineTo(x1 * canvas.width, y1 * canvas.height);
      ctx.stroke();
    });

    socket.on("annotation_clear", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off("annotation");
      socket.off("annotation_clear");
    };
  }, []);

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e, canvas);

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";
    ctx.moveTo(
      lastPos.current.x * canvas.width,
      lastPos.current.y * canvas.height,
    );
    ctx.lineTo(pos.x * canvas.width, pos.y * canvas.height);
    ctx.stroke();

    socket.emit("annotation", {
      roomId,
      x0: lastPos.current.x,
      y0: lastPos.current.y,
      x1: pos.x,
      y1: pos.y,
      color,
      thickness,
    });

    lastPos.current = pos;
  };

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={450}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          cursor: "crosshair",
          pointerEvents: "all",
        }}
        onMouseDown={(e) => {
          isDrawing.current = true;
          lastPos.current = getPos(e, canvasRef.current!);
        }}
        onMouseMove={draw}
        onMouseUp={() => {
          isDrawing.current = false;
        }}
        onMouseLeave={() => {
          isDrawing.current = false;
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          display: "flex",
          gap: 6,
          background: "#fff",
          border: "2px solid #000",
          padding: 6,
          pointerEvents: "all",
        }}
      >
        {COLORS.map((c) => (
          <div
            key={c}
            onClick={() => setColor(c)}
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: c,
              cursor: "pointer",
              outline: color === c ? "3px solid #000" : "none",
              outlineOffset: 2,
            }}
          />
        ))}
        <button
          onClick={() => setThickness((t) => (t === 2 ? 6 : 2))}
          style={{
            padding: "0 8px",
            border: "1px solid #000",
            cursor: "pointer",
          }}
        >
          {thickness === 2 ? "Thin" : "Thick"}
        </button>
        <button
          onClick={() => socket.emit("annotation_clear", { roomId })}
          style={{
            padding: "0 8px",
            border: "1px solid #000",
            background: "#FF3D57",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
```

---

## Part 5 — Running Everything

### Start order

```
Terminal 1
docker-compose up -d
docker-compose logs postgres     verify database ready

Terminal 2
cd server
npx prisma migrate dev --name init    first time only
npm run dev

Terminal 3
cd client
npm run dev
```

### Test in browser

```
http://localhost:5173
```

Register as teacher, create a class, copy the join key.
Open a new incognito window, go to localhost:5173/join/KEY,
register as student. Both land in the class. Teacher posts
an announcement. Teacher starts a live session. Student joins.

---

## Part 6 — Production Build

### Build frontend

```
cd client
npm run build
npm install -g serve
serve -s dist -l 5173
```

### Run backend without nodemon

```
cd server
npm start
```

### Find your local IP for cross-device access

```
ip addr show | grep "inet " | grep -v 127.0.0.1
```

Update both .env files replacing localhost with your IP.
Update livekit.yaml node_ip with your IP.
Restart all services.
Open firewall ports:

```
sudo ufw allow 3001
sudo ufw allow 5173
sudo ufw allow 7880
sudo ufw allow 7881
sudo ufw allow 7882/udp
```

Everyone on the same network opens http://YOUR_IP:5173

---

## Part 7 — Verification Checklist

Work through this in order. Do not skip steps.

```
Infrastructure
  docker-compose up -d runs without errors
  curl http://localhost:7880 returns a response
  psql or prisma studio shows all 6 tables created

Auth
  POST /auth/register returns { user, token }
  POST /auth/login returns { user, token }
  GET /auth/me with Bearer token returns user
  GET /auth/me without token returns 401

Classes
  POST /classes creates class with join key
  GET /classes/join/:key returns class preview
  POST /enroll creates student account and enrollment

Feed
  POST /feed/classes/:id creates announcement
  GET /feed/classes/:id returns items
  POST /upload saves file and returns URL

Live Session
  POST /sessions/classes/:id creates session
  POST /sessions/:id/start sets status to live
  GET /token with Bearer token returns Livekit JWT
  GET /token without Bearer token returns 401

WebRTC
  Two browser tabs open the room page
  Both show video tiles after allowing camera
  Speaking in one tab shows audio in the other

Real-time features
  Student reaction button updates teacher sidebar within 1 second
  Annotation stroke appears on other tab within 300ms
  Attention score appears in teacher sidebar within 5 seconds
  Raise hand appears in teacher sidebar immediately
```

---

## Known Limitations and Production Notes

```
File storage
  Currently saves to server/uploads/ on local disk
  In production replace with AWS S3 or Cloudflare R2
  Change upload.js to use multer-s3 and return CDN URLs

Database
  PostgreSQL runs in Docker locally
  In production use Railway, Supabase, or RDS
  DATABASE_URL just changes in .env, nothing else

Livekit
  Runs in Docker locally using devkey and secret
  In production use Livekit Cloud
  Replace LIVEKIT_HOST, LIVEKIT_API_KEY, LIVEKIT_API_SECRET in .env

In-memory store
  Room state (reactions, attention scores, raised hands) is ephemeral
  Resets if backend restarts
  In production replace store/index.js with a Redis client
  Interface is identical so no other files change

CORS
  Currently allows only CLIENT_URL origin
  In production set this to your actual frontend domain

JWT secret
  Change JWT_SECRET to a long random string in production
  Never commit .env to git
```
