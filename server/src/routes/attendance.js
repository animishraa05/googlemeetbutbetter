const express = require("express");
const prisma = require("../db");
const router = express.Router();

/**
 * POST /attendance/:sessionId/mark
 * Mark attendance for a student joining a session
 * Body: { studentId }
 */
router.post("/:sessionId/mark", async (req, res) => {
  const { sessionId } = req.params;
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: "studentId is required" });
  }

  // Verify session exists and is live
  const session = await prisma.liveSession.findUnique({
    where: { id: parseInt(sessionId) },
    include: { class: { include: { enrollments: true } } },
  });

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  if (session.status !== "live") {
    return res.status(400).json({ error: "Session is not live" });
  }

  // Verify student is enrolled in the class
  const isEnrolled = session.class.enrollments.some(
    (e) => e.studentId === studentId
  );

  if (!isEnrolled) {
    return res.status(403).json({ error: "Student not enrolled in this class" });
  }

  // Create or update attendance record
  try {
    const attendance = await prisma.attendance.upsert({
      where: {
        sessionId_studentId: {
          sessionId: parseInt(sessionId),
          studentId: parseInt(studentId),
        },
      },
      update: {
        joinedAt: new Date(),
        leftAt: null,
        duration: null,
      },
      create: {
        sessionId: parseInt(sessionId),
        studentId: parseInt(studentId),
        joinedAt: new Date(),
      },
    });

    res.json({ attendance, message: "Attendance marked" });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark attendance" });
  }
});

/**
 * POST /attendance/:sessionId/leave
 * Mark when a student leaves the session
 * Body: { studentId }
 */
router.post("/:sessionId/leave", async (req, res) => {
  const { sessionId } = req.params;
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: "studentId is required" });
  }

  try {
    const attendance = await prisma.attendance.findUnique({
      where: {
        sessionId_studentId: {
          sessionId: parseInt(sessionId),
          studentId: parseInt(studentId),
        },
      },
    });

    if (!attendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    const leftAt = new Date();
    const duration = Math.floor((leftAt.getTime() - attendance.joinedAt.getTime()) / 1000);

    const updated = await prisma.attendance.update({
      where: {
        sessionId_studentId: {
          sessionId: parseInt(sessionId),
          studentId: parseInt(studentId),
        },
      },
      data: {
        leftAt,
        duration,
      },
    });

    res.json({ attendance: updated, message: "Left at recorded", duration });
  } catch (error) {
    res.status(500).json({ error: "Failed to update attendance" });
  }
});

/**
 * GET /attendance/:sessionId/report
 * Get attendance report for a session
 */
router.get("/:sessionId/report", async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await prisma.liveSession.findUnique({
      where: { id: parseInt(sessionId) },
      include: {
        class: {
          include: {
            enrollments: {
              include: {
                student: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
        attendance: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const totalEnrolled = session.class.enrollments.length;
    const totalPresent = session.attendance.length;
    const attendanceRate = totalEnrolled > 0 
      ? Math.round((totalPresent / totalEnrolled) * 100) 
      : 0;

    // Map attendance status for all enrolled students
    const attendanceMap = new Map(
      session.attendance.map((a) => [
        a.studentId,
        {
          present: true,
          joinedAt: a.joinedAt,
          leftAt: a.leftAt,
          duration: a.duration,
        },
      ])
    );

    const students = session.class.enrollments.map((enrollment) => {
      const attendance = attendanceMap.get(enrollment.student.id);
      return {
        student: enrollment.student,
        present: !!attendance,
        joinedAt: attendance?.joinedAt,
        leftAt: attendance?.leftAt,
        duration: attendance?.duration,
      };
    });

    res.json({
      session: {
        id: session.id,
        title: session.title,
        status: session.status,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
      },
      summary: {
        totalEnrolled,
        totalPresent,
        totalAbsent: totalEnrolled - totalPresent,
        attendanceRate,
      },
      students,
    });
  } catch (error) {
    console.error("Attendance report error:", error);
    res.status(500).json({ error: "Failed to get attendance report" });
  }
});

/**
 * GET /attendance/classes/:classId/sessions
 * Get attendance summary for all sessions in a class
 */
router.get("/classes/:classId/sessions", async (req, res) => {
  const { classId } = req.params;

  try {
    const sessions = await prisma.liveSession.findMany({
      where: { classId: parseInt(classId) },
      include: {
        attendance: {
          select: {
            studentId: true,
            duration: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const summary = sessions.map((session) => ({
      session: {
        id: session.id,
        title: session.title,
        status: session.status,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
      },
      totalPresent: session.attendance.length,
      averageDuration: session.attendance.length > 0
        ? Math.round(
            session.attendance.reduce((sum, a) => sum + (a.duration || 0), 0) /
              session.attendance.length
          )
        : 0,
    }));

    res.json({ sessions: summary });
  } catch (error) {
    res.status(500).json({ error: "Failed to get sessions attendance" });
  }
});

module.exports = router;
