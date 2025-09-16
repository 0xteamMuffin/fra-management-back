import AWS from "aws-sdk";

if (
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY ||
  !process.env.AWS_REGION ||
  !process.env.S3_BUCKET_NAME
) {
  throw new Error(
    "Missing required AWS S3 environment variables. Please check your .env file."
  );
}

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  signatureVersion: "v4",
});

export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

export default s3;
