const express = require('express');
const router = express.Router();
const multer = require('multer');

const { uploadFileToS3, getPresignedUrl } = require('../utils/s3');
const axios = require('axios');

const upload = multer({ storage: multer.memoryStorage() });


// Helper to shorten URLs using is.gd
async function shortenUrl(longUrl) {
  try {
    const encodedUrl = encodeURIComponent(longUrl);
    const isgdResp = await axios.get(`https://is.gd/create.php?format=simple&url=${encodedUrl}`, {
      timeout: 5000
    });
    if (typeof isgdResp.data === 'string' && isgdResp.data.startsWith('http')) {
      return isgdResp.data;
    }
    throw new Error('is.gd did not return a valid URL');
  } catch (err) {
    console.error('is.gd error:', err.message);
    return longUrl; // Fallback to original URL
  }
}

// /upload controller
async function handleUpload(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    // Determine bucket based on origin
    const origin = req.get('origin');
    let bucket = process.env.AWS_S3_BUCKET;
    if (origin === 'https://test-lake-chi-94.vercel.app' || origin === 'https://test-roan-xi-33.vercel.app') {
      bucket = 'lense-api-bucket';
    } else if (origin === 'https://libre-cyan.vercel.app') {
      bucket = 'lense-api-libre-bucket';
    }

    const { bucket: usedBucket, filename } = await uploadFileToS3(req.file, bucket);
    const signedUrl = await getPresignedUrl(usedBucket, filename, 3600);
    const shortUrl = await shortenUrl(signedUrl);
    res.status(200).json({ link: shortUrl });
  } catch (err) {
    console.error('S3 upload error:', err);
    res.status(500).json({ error: 'Failed to upload file to S3' });
  }
}

router.post('/', upload.single('file'), handleUpload);

module.exports = router;
