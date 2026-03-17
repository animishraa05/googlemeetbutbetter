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
