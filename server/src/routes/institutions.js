const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../db");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { institutionName, slug, adminName, adminEmail, adminPassword } =
    req.body;
  if (
    !institutionName ||
    !slug ||
    !adminName ||
    !adminEmail ||
    !adminPassword
  ) {
    return res.status(400).json({ error: "All fields required" });
  }
  const existing = await prisma.institution.findUnique({ where: { slug } });
  if (existing) return res.status(409).json({ error: "Slug already taken" });

  const institution = await prisma.institution.create({
    data: { name: institutionName, slug, adminEmail },
  });
  const hashed = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      password: hashed,
      role: "institution_admin",
      institutionId: institution.id,
    },
  });
  const token = jwt.sign(
    {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      institutionId: institution.id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
  res.status(201).json({ institution, user: admin, token });
});

router.get("/:slug", async (req, res) => {
  const institution = await prisma.institution.findUnique({
    where: { slug: req.params.slug },
  });
  if (!institution)
    return res.status(404).json({ error: "Institution not found" });
  res.json({ institution });
});

module.exports = router;
