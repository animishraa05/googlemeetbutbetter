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

// Routes
const authenticate = require("./src/middleware/authenticate");
const authRoutes = require("./src/routes/auth");
const classRoutes = require("./src/routes/classes");
const enrollRoutes = require("./src/routes/enroll");
const feedRoutes = require("./src/routes/feed");
const uploadRoutes = require("./src/routes/upload");
const sessionsRoutes = require("./src/routes/sessions");
const attendanceRoutes = require("./src/routes/attendance");
const roomsRoutes = require("./src/routes/rooms");
const tokenRoutes = require("./src/routes/token");
const classesJoinRoutes = require("./src/routes/classesJoin");
const institutionsRoutes = require("./src/routes/institutions");
const adminRoutes = require("./src/routes/admin"); // New admin routes

app.use("/auth", authRoutes);
app.use("/token", authenticate, tokenRoutes);
app.use("/rooms", roomsRoutes);
app.use("/institutions", institutionsRoutes);
app.use("/admin", adminRoutes);

// Public class join endpoint (must be before authenticated /classes routes)
app.use("/classes-join", classesJoinRoutes);
app.use("/classes", authenticate, classRoutes);
app.use("/feed", authenticate, feedRoutes);
app.use("/sessions", authenticate, sessionsRoutes);
app.use("/enroll", enrollRoutes);
app.use("/upload", authenticate, uploadRoutes);
app.use("/attendance", authenticate, attendanceRoutes);

io.on("connection", (socket) => {
  require("./src/socket")(io, socket);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Proxima backend running on http://localhost:${PORT}`);
});
