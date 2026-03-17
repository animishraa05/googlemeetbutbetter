const express = require("express");
const { RoomServiceClient } = require("livekit-server-sdk");
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
