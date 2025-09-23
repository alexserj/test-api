const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const path = require('path');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadFileToS3(file) {
  const ext = path.extname(file.originalname);
  const filename = `${crypto.randomUUID()}${ext}`;
  const bucket = process.env.AWS_S3_BUCKET;
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: filename,
    Body: file.buffer,
    ContentType: file.mimetype,
  }));
  return { bucket, filename };
}

async function getPresignedUrl(bucket, filename, expiresIn = 3600) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: filename });
  return getSignedUrl(s3, command, { expiresIn });
}

module.exports = {
  uploadFileToS3,
  getPresignedUrl,
};
