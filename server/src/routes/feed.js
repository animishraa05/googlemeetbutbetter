const express = require("express");
const prisma = require("../db");
const router = express.Router();

router.get("/classes/:classId", async (req, res) => {
  const classId = parseInt(req.params.classId);
  const page = parseInt(req.query.page || "1");
  const limit = parseInt(req.query.limit || "20");

  const [items, total] = await Promise.all([
    prisma.feedItem.findMany({
      where: { classId },
      include: { author: { select: { name: true, role: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.feedItem.count({ where: { classId } }),
  ]);
  res.json({ items, total, page });
});

router.post("/classes/:classId", async (req, res) => {
  if (!["teacher", "institution_admin"].includes(req.user.role)) {
    return res.status(403).json({ error: "Only teachers can post to feed" });
  }
  const { type, title, body, fileUrl, fileName } = req.body;
  if (!type) return res.status(400).json({ error: "type is required" });

  const item = await prisma.feedItem.create({
    data: {
      classId: parseInt(req.params.classId),
      authorId: req.user.id,
      type,
      title,
      body,
      fileUrl,
      fileName,
    },
    include: { author: { select: { name: true, role: true } } },
  });
  res.status(201).json({ item });
});

router.delete("/:itemId", async (req, res) => {
  const item = await prisma.feedItem.findUnique({
    where: { id: parseInt(req.params.itemId) },
  });
  if (!item) return res.status(404).json({ error: "Item not found" });
  if (item.authorId !== req.user.id) {
    return res.status(403).json({ error: "Not your post" });
  }
  await prisma.feedItem.delete({ where: { id: item.id } });
  res.json({ deleted: true });
});

module.exports = router;
