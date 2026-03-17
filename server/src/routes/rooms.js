const express = require("express");
const store = require("../store");
const router = express.Router();

/**
 * POST /rooms/create
 * Body: { roomName, teacherName }
 */
router.post("/create", (req, res) => {
  const { roomName, teacherName } = req.body;

  if (!teacherName?.trim())
    return res.status(400).json({ error: "teacherName is required" });

  const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const room = store.createRoom(
    roomId,
    roomName?.trim() || `Class ${roomId}`,
    teacherName.trim(),
  );

  return res.status(201).json({ roomId, room });
});

/**
 * GET /rooms/list
 */
router.get("/list", (_req, res) => {
  return res.json(store.getAllRooms());
});

/**
 * GET /rooms/:roomId
 */
router.get("/:roomId", (req, res) => {
  const room = store.getRoom(req.params.roomId);
  if (!room) return res.status(404).json({ error: "Room not found" });
  return res.json(room);
});

module.exports = router;
