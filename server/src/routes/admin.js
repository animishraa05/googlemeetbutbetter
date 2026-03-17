const express = require("express");
const prisma = require("../db");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

// Get admin dashboard stats
router.get("/stats", authenticate, async (req, res) => {
  if (req.user.role !== "institution_admin") {
    return res.status(403).json({ error: "Forbidden: Admin access only" });
  }

  const institutionId = req.user.institutionId;
  if (!institutionId) {
    return res.status(400).json({ error: "User is not linked to an institution" });
  }

  try {
    const totalTeachers = await prisma.user.count({
      where: { institutionId, role: "teacher" },
    });

    const totalStudents = await prisma.user.count({
      where: { institutionId, role: "student" },
    });

    const activeClasses = await prisma.class.count({
      where: { institutionId },
    });

    const recentClasses = await prisma.class.findMany({
      where: { institutionId },
      include: {
        teacher: { select: { name: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    });

    res.json({
      stats: {
        totalTeachers,
        totalStudents,
        activeClasses,
      },
      recentClasses: recentClasses.map(c => ({
        id: c.id,
        name: c.name,
        teacher: c.teacher.name,
        students: c._count.enrollments,
      }))
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const bcrypt = require('bcryptjs');

// Create a new teacher
router.post("/teachers", authenticate, async (req, res) => {
  if (req.user.role !== "institution_admin") {
    return res.status(403).json({ error: "Forbidden: Admin access only" });
  }

  const institutionId = req.user.institutionId;
  if (!institutionId) {
    return res.status(400).json({ error: "User is not linked to an institution" });
  }

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: "A user with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "teacher",
        institutionId
      }
    });

    res.json({ success: true, teacher: { id: teacher.id, name: teacher.name, email: teacher.email } });
  } catch (err) {
    console.error("Teacher creation error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
