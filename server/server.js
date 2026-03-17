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
// Public class join endpoint (must be before authenticated /classes routes)
app.use("/classes/join", require("./src/routes/classesJoin"));
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
app.use(
  "/attendance",
  require("./src/middleware/authenticate"),
  require("./src/routes/attendance"),
);

io.on("connection", (socket) => {
  require("./src/socket")(io, socket);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Proxima backend running on http://localhost:${PORT}`);
});
