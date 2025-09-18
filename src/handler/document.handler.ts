import { Request, Response } from "express";
import db from "../db/db";

const DOCUMENT_PROCESSING_API_URL =
  process.env.NODE_ENV === "development"
    ? "http://0.0.0.0:8001"
    : "http://document-processing-api:8001";

const CALLBACK_BASE_URL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:${process.env.PORT || 4000}`
    : `http://app:${process.env.PORT || 4000}`;

export const processDocument = async (req: Request, res: Response) => {
  try {
    const { s3Key } = req.body;

    const newProcessingJob = await db.documentProcessing.create({
      data: {
        s3Key,
        status: "PENDING",
      },
    });

    fetch(`${DOCUMENT_PROCESSING_API_URL}/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        s3Key,
        processingId: newProcessingJob.id,

        callbackUrl: `${CALLBACK_BASE_URL}/api/v1/documents/callback/${newProcessingJob.id}`,
      }),
    }).catch((error) => {
      console.error("Failed to trigger document processing service:", error);
    });

    return res.status(202).json({
      message: "Document processing started.",
      processingId: newProcessingJob.id,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Failed to start document processing" });
  }
};

export const documentProcessingCallback = async (
  req: Request,
  res: Response,
) => {
  try {
    const { processingId } = req.params;
    const { status, ...results } = req.body;

    await db.documentProcessing.update({
      where: { id: processingId },
      data: {
        status,
        ...results,
      },
    });

    return res.status(200).json({ message: "Callback received" });
  } catch (error) {
    console.error("Callback failed:", error);
    return res.status(500).json({ message: "Failed to process callback" });
  }
};

export const getDocumentProcessingStatus = async (
  req: Request,
  res: Response,
) => {
  try {
    const { processingId } = req.params;
    const job = await db.documentProcessing.findUnique({
      where: { id: processingId },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json(job);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve job status" });
  }
};
