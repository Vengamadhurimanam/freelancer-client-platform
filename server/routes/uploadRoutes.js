const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

router.post('/single', protect, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        name: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
        fileType: req.file.mimetype,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/multiple', protect, upload.array('files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const uploaded = req.files.map((file) => ({
      name: file.originalname,
      url: `/uploads/${file.filename}`,
      size: file.size,
      fileType: file.mimetype,
    }));

    return res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      files: uploaded,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
