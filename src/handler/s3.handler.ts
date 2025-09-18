import { Request, Response } from "express";
import s3Client, { S3_BUCKET_NAME } from "../lib/s3";
import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const getPresignedUrl = async (req: Request, res: Response) => {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res
        .status(400)
        .json({ message: "fileName and fileType are required" });
    }

    const fileKey = `uploads/${uuidv4()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60 * 5, // 5 minutes
    });

    return res.status(200).json({
      uploadUrl,
      key: fileKey,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return res.status(500).json({ message: "Failed to generate upload URL" });
  }
};

export const getPresignedViewUrl = async (req: Request, res: Response) => {
  try {
    const { key } = req.query;

    if (!key) {
      return res.status(400).json({ message: "A file key is required" });
    }

    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key as string,
    });

    const viewUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60 * 5, // 5 minutes
    });

    return res.status(200).json({ viewUrl });
  } catch (error) {
    console.error("Error generating presigned view URL:", error);
    return res.status(500).json({ message: "Failed to generate view URL" });
  }
};
