const store = require("../store");
const prisma = require("../db");

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

  // ── JOIN SESSION (with attendance tracking) ────────

  socket.on("join_session", async ({ sessionId, studentId } = {}) => {
    if (!validate({ sessionId, studentId }, ["sessionId", "studentId"])) return;

    try {
      // Mark attendance in database
      const session = await prisma.liveSession.findUnique({
        where: { id: parseInt(sessionId) },
        include: { class: { include: { enrollments: true } } },
      });

      if (session && session.status === "live") {
        const isEnrolled = session.class.enrollments.some(
          (e) => e.studentId === parseInt(studentId)
        );

        if (isEnrolled) {
          await prisma.attendance.upsert({
            where: {
              sessionId_studentId: {
                sessionId: parseInt(sessionId),
                studentId: parseInt(studentId),
              },
            },
            update: { joinedAt: new Date(), leftAt: null, duration: null },
            create: {
              sessionId: parseInt(sessionId),
              studentId: parseInt(studentId),
              joinedAt: new Date(),
            },
          });
          socket.data.sessionId = sessionId;
          socket.data.studentId = studentId;
          console.log(`[attendance] Student ${studentId} marked present for session ${sessionId}`);
        }
      }
    } catch (error) {
      console.error("[socket] Error marking attendance:", error.message);
    }
  });

  // ── LEAVE SESSION (update attendance duration) ─────

  socket.on("leave_session", async ({ sessionId, studentId } = {}) => {
    if (!validate({ sessionId, studentId }, ["sessionId", "studentId"])) return;

    try {
      const attendance = await prisma.attendance.findUnique({
        where: {
          sessionId_studentId: {
            sessionId: parseInt(sessionId),
            studentId: parseInt(studentId),
          },
        },
      });

      if (attendance) {
        const leftAt = new Date();
        const duration = Math.floor((leftAt.getTime() - attendance.joinedAt.getTime()) / 1000);

        await prisma.attendance.update({
          where: {
            sessionId_studentId: {
              sessionId: parseInt(sessionId),
              studentId: parseInt(studentId),
            },
          },
          data: { leftAt, duration },
        });

        console.log(`[attendance] Student ${studentId} left session ${sessionId}, duration: ${duration}s`);
      }
    } catch (error) {
      console.error("[socket] Error updating attendance:", error.message);
    }
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
    const { roomId, name, role, sessionId, studentId } = socket.data || {};
    
    // Auto-mark attendance left when student disconnects from session
    if (sessionId && studentId && role === "student") {
      prisma.attendance.findUnique({
        where: {
          sessionId_studentId: {
            sessionId: parseInt(sessionId),
            studentId: parseInt(studentId),
          },
        },
      }).then((attendance) => {
        if (attendance && !attendance.leftAt) {
          const leftAt = new Date();
          const duration = Math.floor((leftAt.getTime() - attendance.joinedAt.getTime()) / 1000);
          prisma.attendance.update({
            where: {
              sessionId_studentId: {
                sessionId: parseInt(sessionId),
                studentId: parseInt(studentId),
              },
            },
            data: { leftAt, duration },
          }).catch(() => {});
        }
      }).catch(() => {});
    }
    
    if (!roomId || !name) return;

    if (role === "student") {
      store.removeStudent(roomId, name);
      store.lowerHand(roomId, name);
    }

    io.to(roomId).emit("user_left", { name, role });
    console.log(`[socket] ${name} disconnected — ${reason}`);
  });
};
