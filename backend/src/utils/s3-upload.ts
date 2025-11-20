import { promises as fs } from 'fs';
import path from 'path';
import { PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { s3Client } from '../config/s3';

const hasAwsConfig =
  !!process.env.AWS_BUCKET_NAME &&
  !!process.env.AWS_REGION &&
  !!process.env.AWS_ACCESS_KEY_ID &&
  !!process.env.AWS_SECRET_ACCESS_KEY;

const objectAcl = process.env.S3_OBJECT_ACL?.trim();

const appBaseUrl = (process.env.APP_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');
const useDirectS3Url = process.env.S3_DIRECT_URL === 'true';
const s3CdnBaseUrl = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, '');

const buildPublicUrl = (fileKey: string) => {
  if (hasAwsConfig && process.env.AWS_BUCKET_NAME) {
    if (useDirectS3Url) {
      const base = s3CdnBaseUrl || `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com`;
      return `${base}/${fileKey}`;
    }

    return `${appBaseUrl}/files/${encodeURIComponent(fileKey)}`;
  }

  return `${appBaseUrl}/uploads/${path.basename(fileKey)}`;
};

const saveLocally = async (file: Express.Multer.File, fileKey: string) => {
  const uploadsDir = path.resolve(__dirname, '../../uploads');
  await fs.mkdir(uploadsDir, { recursive: true });
  const destination = path.join(uploadsDir, path.basename(fileKey));
  await fs.writeFile(destination, file.buffer);
};

export const uploadToS3 = async (file: Express.Multer.File) => {
  const fileKey = `uploads/${Date.now()}-${file.originalname}`;
  if (hasAwsConfig && process.env.AWS_BUCKET_NAME) {
    const params: PutObjectCommandInput = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    if (objectAcl) {
      params.ACL = objectAcl as PutObjectCommandInput['ACL'];
    }

    await s3Client.send(new PutObjectCommand(params));
  } else {
    await saveLocally(file, fileKey);
  }

  return buildPublicUrl(fileKey);
};

