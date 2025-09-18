import { z } from "zod";

export const processDocumentSchema = z.object({
  body: z.object({
    s3Key: z.string().min(1, "s3Key is required"),
  }),
});

export const callbackSchema = z.object({
  body: z.object({
    status: z.enum(["NER_COMPLETE", "FAILED"]),
    ocrEngineUsed: z.string().optional(),
    extractedText: z.string().optional(),
    structuredData: z.any().optional(),
    errorMessage: z.string().optional(),
  }),
  params: z.object({
    processingId: z.string().uuid("Invalid processingId UUID"),
  }),
});
