import dotenv from 'dotenv';
import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";

dotenv.config();

const region = process.env.AWS_REGION || "us-east-1";
const hasStaticCreds = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

const config: S3ClientConfig = {
  region,
};

if (hasStaticCreds) {
  config.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  };
}

export const s3Client = new S3Client(config);