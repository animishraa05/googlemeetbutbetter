const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const prisma = require("../db");
const router = express.Router();

const uploadDir = process.env.UPLOAD_DIR || "./uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || "10") * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      ".pdf",
      ".png",
      ".jpg",
      ".jpeg",
      ".doc",
      ".docx",
      ".ppt",
      ".pptx",
      ".txt",
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not allowed`));
    }
  },
});

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  const fileName = req.file.originalname;

  res.json({ url: fileUrl, fileUrl, fileName });
});

module.exports = router;
module.exports.upload = upload;
