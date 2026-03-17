const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../db");
const router = express.Router();

router.post("/", async (req, res) => {
  const { joinKey, name, username, password } = req.body;
  if (!joinKey || !name || !username || !password) {
    return res.status(400).json({ error: "All fields required" });
  }
  const cls = await prisma.class.findUnique({
    where: { joinKey },
  });
  if (!cls) return res.status(404).json({ error: "Invalid join key" });

  const existing = await prisma.user.findFirst({
    where: { username, institutionId: cls.institutionId },
  });
  if (existing)
    return res
      .status(409)
      .json({ error: "Username taken in this institution" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      username,
      email: `${username}@student.proxima`,
      password: hashed,
      role: "student",
      institutionId: cls.institutionId,
    },
  });
  await prisma.enrollment.create({
    data: { classId: cls.id, studentId: user.id },
  });
  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "6h" },
  );
  res.status(201).json({ user, token, classId: cls.id });
});

module.exports = router;
