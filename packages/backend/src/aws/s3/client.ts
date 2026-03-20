import { S3Client } from '@aws-sdk/client-s3';

let s3Client: S3Client | null = null;

export function getS3Client(): S3Client | null {
  const storageEnabled = process.env.ENABLE_DOCUMENT_STORAGE === 'true';
  if (!storageEnabled) return null;

  const region = process.env.AWS_REGION || 'us-east-1';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    console.warn('[s3/client] AWS credentials not set — S3 storage disabled');
    return null;
  }

  if (!s3Client) {
    s3Client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  return s3Client;
}
