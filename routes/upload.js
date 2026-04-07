const express = require('express');
const router = express.Router();
const multer = require('multer');

const { uploadFileToS3, getPresignedUrl } = require('../utils/s3');
const axios = require('axios');

const upload = multer({ storage: multer.memoryStorage() });


// Helper to shorten URLs using is.gd
async function shortenUrl(longUrl) {
  try {
    console.log('[is.gd] Attempting to shorten URL:', longUrl);
    const encodedUrl = encodeURIComponent(longUrl);
    const isgdResp = await axios.get(`https://is.gd/create.php?format=simple&url=${encodedUrl}`, {
      timeout: 5000
    });
    console.log('[is.gd] Response:', isgdResp.data);
    if (typeof isgdResp.data === 'string' && isgdResp.data.startsWith('http')) {
      return isgdResp.data;
    }
    // Log the full response for debugging
    console.error('[is.gd] Unexpected response:', isgdResp.data);
    throw new Error('is.gd did not return a valid URL');
  } catch (err) {
    console.error('is.gd error:', err.message);
    // Optionally, you could try another shortener here
    return longUrl; // Fallback to original URL
  }
}

// /upload controller
async function handleUpload(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    // Combine X-App-Variant header and origin checks
    const appVariant = req.get('X-App-Variant');
    const origin = req.get('origin');
    let bucket = process.env.AWS_S3_BUCKET;
    let customFilename = undefined;
    // Approved origins for each variant
    const mainOrigins = [
      'https://dg-bold.vercel.app'
    ];
    const mobileOrigins = [
      'https://dg-bold-mobile.vercel.app',
      'https://boldlooksaigenerator.dolcegabbana.com'
    ];
    if (appVariant === 'main' && mainOrigins.includes(origin)) {
      bucket = 'lense-api-dg-bolt-bucket';
      customFilename = 'DGBeautyBoldLook.jpg';
    } else if (appVariant === 'mobile' && mobileOrigins.includes(origin)) {
      bucket = 'lense-api-dg-bold-mobile-bucket';
    } else if (!appVariant) {
      // fallback to origin logic for legacy support
      if (origin === 'https://test-lake-chi-94.vercel.app' || origin === 'https://test-roan-xi-33.vercel.app') {
        bucket = 'lense-api-bucket';
      } else if (origin === 'https://libre-cyan.vercel.app') {
        bucket = 'lense-api-libre-bucket';
      } else if (origin === 'https://dg-fresh.vercel.app') {
        bucket = 'lense-api-dg-fresh-bucket';
      } else if (mainOrigins.includes(origin)) {
        bucket = 'lense-api-dg-bolt-bucket';
        customFilename = 'DGBeautyBoldLook.jpg';
      } else if (origin === 'https://dg-fresh-mobile.vercel.app' || origin === 'https://ailipswardrobe.dolcegabbana.com') {
        bucket = 'lense-api-dg-fresh-mobile-bucket';
      } else if (mobileOrigins.includes(origin)) {
        bucket = 'lense-api-dg-bold-mobile-bucket';
      }
    } else {
      // If header is present but origin is not approved, fallback or reject
      return res.status(403).json({ error: 'Origin not approved for this variant' });
    }

    const { bucket: usedBucket, filename } = await uploadFileToS3(req.file, bucket, customFilename);
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
