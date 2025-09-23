
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const morgan = require('morgan');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const path = require('path');
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const PORT = process.env.PORT || 3001;
app.use(morgan('dev'));

// Support multiple origins via comma-separated env variable
const allowedOrigins = (process.env.ALLOWED_ORIGIN || '*')
  .split(',')
  .map(origin => origin.trim());

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like curl or mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.options('/stats', (req, res) => {
  res.sendStatus(200);
});

app.post('/stats', async (req, res) => {
  const stats = req.body;
  const index = process.env.ELASTIC_INDEX;
  const esUrl = `${process.env.ELASTIC_URL}/${index}/_doc`;
  try {
    const esResponse = await axios.post(
      esUrl,
      stats,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.ELASTIC_AUTH,
        },
        validateStatus: () => true // allow all status codes
      }
    );
    console.log('Elasticsearch response status:', esResponse.status);
    console.log('Elasticsearch response data:', esResponse.data);
    res.status(200).json({ success: true, result: esResponse.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to push to Elasticsearch' });
  }
});

// AWS S3 client setup
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Upload route
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    const ext = path.extname(req.file.originalname);
    const filename = `${crypto.randomUUID()}${ext}`;
    const bucket = process.env.AWS_S3_BUCKET;

    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: filename,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    // Generate a pre-signed URL for downloading the file (valid for 1 hour)
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
    const { GetObjectCommand } = require('@aws-sdk/client-s3');
    const command = new GetObjectCommand({ Bucket: bucket, Key: filename });
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    res.status(200).json({ link: signedUrl });
  } catch (err) {
    console.error('S3 upload error:', err);
    res.status(500).json({ error: 'Failed to upload file to S3' });
  }
});

app.listen(PORT, () => {
  console.log(`Middleware listening on port ${PORT}`);
});
