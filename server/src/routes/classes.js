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

module.exports = router;
