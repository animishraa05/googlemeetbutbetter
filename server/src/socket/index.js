const store = require("../store");

/**
 * All Socket.io event handlers.
 * Registered once per connected client from server.js.
 */
module.exports = function registerSocketHandlers(io, socket) {
  const validate = (payload, fields) => {
    for (const f of fields) {
      if (
        payload?.[f] === undefined ||
        payload?.[f] === null ||
        payload?.[f] === ""
      ) {
        socket.emit("error", { message: `Missing field: ${f}` });
        return false;
      }
    }
    return true;
  };

  // ── JOIN ROOM ──────────────────────────────────────

  socket.on("join_room", ({ roomId, name, role } = {}) => {
    if (!validate({ roomId, name, role }, ["roomId", "name", "role"])) return;

    const prev = socket.data?.roomId;
    if (prev && prev !== roomId) {
      socket.leave(prev);
      if (socket.data.role === "student")
        store.removeStudent(prev, socket.data.name);
    }

    socket.join(roomId);
    socket.data = { roomId, name, role };

    if (role === "student") store.addStudent(roomId, name);

    io.to(roomId).emit("user_joined", { name, role });
    console.log(`[socket] ${name} (${role}) joined ${roomId}`);
  });

  // ── REACTION ───────────────────────────────────────

  socket.on("student_reaction", ({ roomId, studentName, type } = {}) => {
    if (
      !validate({ roomId, studentName, type }, [
        "roomId",
        "studentName",
        "type",
      ])
    )
      return;

    store.updateReaction(roomId, type);
    const room = store.getRoom(roomId);
    if (!room) return;

    io.to(roomId).emit("reaction_update", {
      from: studentName,
      type,
      counts: room.reactions,
    });
  });

  // ── ANNOTATION ─────────────────────────────────────

  socket.on("annotation", (data = {}) => {
    if (!validate(data, ["roomId", "x0", "y0", "x1", "y1"])) return;
    socket.to(data.roomId).emit("annotation", data);
  });

  socket.on("annotation_clear", ({ roomId } = {}) => {
    if (!roomId) return;
    io.to(roomId).emit("annotation_clear");
  });

  // ── ATTENTION SCORE ────────────────────────────────

  socket.on("attention_score", ({ roomId, studentName, score } = {}) => {
    if (
      !validate({ roomId, studentName, score }, [
        "roomId",
        "studentName",
        "score",
      ])
    )
      return;

    store.updateAttention(roomId, studentName, score);
    const room = store.getRoom(roomId);
    if (!room) return;

    io.to(roomId).emit("attention_update", {
      studentName,
      score,
      allScores: room.attentionScores,
    });
  });

  // ── RAISE / LOWER HAND ─────────────────────────────

  socket.on("raise_hand", ({ roomId, studentName } = {}) => {
    if (!validate({ roomId, studentName }, ["roomId", "studentName"])) return;
    store.raiseHand(roomId, studentName);
    io.to(roomId).emit("hand_raised", { studentName });
  });

  socket.on("lower_hand", ({ roomId, studentName } = {}) => {
    if (!validate({ roomId, studentName }, ["roomId", "studentName"])) return;
    store.lowerHand(roomId, studentName);
    io.to(roomId).emit("hand_lowered", { studentName });
  });

  // ── DISCONNECT ─────────────────────────────────────

  socket.on("disconnect", (reason) => {
    const { roomId, name, role } = socket.data || {};
    if (!roomId || !name) return;

    if (role === "student") {
      store.removeStudent(roomId, name);
      store.lowerHand(roomId, name);
    }

    io.to(roomId).emit("user_left", { name, role });
    console.log(`[socket] ${name} disconnected — ${reason}`);
  });
};
