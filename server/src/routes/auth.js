const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../db");
const router = express.Router();

const signToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

router.post("/register", async (req, res) => {
  const { name, email, password, role, institutionId } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields required" });
  }
  const existing = await prisma.user.findFirst({
    where: { email, institutionId: institutionId || null },
  });
  if (existing)
    return res.status(409).json({ error: "Email already registered" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role,
      institutionId: institutionId || null,
    },
  });
  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token: signToken(user),
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "All fields required" });

  const user = await prisma.user.findFirst({ where: { email } });
  if (!user)
    return res.status(401).json({ error: "Invalid email or password" });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(401).json({ error: "Invalid email or password" });

  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token: signToken(user),
  });
});

router.get("/me", require("../middleware/authenticate"), async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

module.exports = router;
