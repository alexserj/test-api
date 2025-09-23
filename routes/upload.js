const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFileToS3, getPresignedUrl } = require('../utils/s3');

const upload = multer({ storage: multer.memoryStorage() });

// /upload controller
async function handleUpload(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    const { bucket, filename } = await uploadFileToS3(req.file);
    const signedUrl = await getPresignedUrl(bucket, filename, 3600);
    res.status(200).json({ link: signedUrl });
  } catch (err) {
    console.error('S3 upload error:', err);
    res.status(500).json({ error: 'Failed to upload file to S3' });
  }
}

router.post('/', upload.single('file'), handleUpload);

module.exports = router;
