import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Client } from './client';

const DEFAULT_TTL = 3600; // 1 hour

export const documentStorage = {
  buildDocumentKey(documentId: string, fileName: string): string {
    return `documents/${documentId}/${fileName}`;
  },

  async uploadBuffer(key: string, buffer: Buffer, mimeType: string): Promise<boolean> {
    const client = getS3Client();
    const bucket = process.env.AWS_S3_DOCUMENTS_BUCKET;

    if (!client || !bucket) {
      console.warn('[documentStorage] S3 not configured — skipping upload');
      return true; // no-op in mock mode
    }

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
    );

    return true;
  },

  async getPresignedDownloadUrl(key: string, ttlSeconds?: number): Promise<string | null> {
    const client = getS3Client();
    const bucket = process.env.AWS_S3_DOCUMENTS_BUCKET;

    if (!client || !bucket) {
      return null;
    }

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const url = await getSignedUrl(client, command, {
      expiresIn: ttlSeconds ?? parseInt(process.env.AWS_S3_PRESIGN_TTL_SECONDS || String(DEFAULT_TTL)),
    });

    // If CloudFront domain is configured, replace S3 host with CloudFront domain
    const cloudfrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN;
    if (cloudfrontDomain) {
      try {
        const parsedUrl = new URL(url);
        // Replace the host with CloudFront domain, keep path and query string
        const cloudfrontUrl = new URL(parsedUrl.pathname + parsedUrl.search, `https://${cloudfrontDomain}`);
        return cloudfrontUrl.toString();
      } catch {
        // If URL parsing fails, return original
        return url;
      }
    }

    return url;
  },
};
