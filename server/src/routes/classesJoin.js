const express = require("express");
const prisma = require("../db");
const router = express.Router();

/**
 * GET /classes/join/:joinKey
 * Public endpoint to get class info by join key (before enrollment)
 */
router.get("/:joinKey", async (req, res) => {
  const cls = await prisma.class.findUnique({
    where: { joinKey: req.params.joinKey },
    include: {
      teacher: { select: { name: true } },
      institution: { select: { name: true } },
    },
  });
  if (!cls) return res.status(404).json({ error: "Invalid join key" });
  res.json({
    className: cls.name,
    subject: cls.subject,
    teacherName: cls.teacher.name,
    institutionName: cls.institution?.name,
    classId: cls.id,
  });
});

module.exports = router;
