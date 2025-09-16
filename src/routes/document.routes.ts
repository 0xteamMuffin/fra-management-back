import { Router } from "express";
import {
  processDocument,
  documentProcessingCallback,
  getDocumentProcessingStatus,
} from "../handler/document.handler";
import {
  processDocumentSchema,
  callbackSchema,
} from "../schemas/document.schema";
import { validate } from "../middleware/validate.middleware";
import { authenticateJWT } from "../middleware/auth.middleware";

const router = Router();

// Endpoint to start the processing job
router.post(
  "/process",
  authenticateJWT,
  validate(processDocumentSchema),
  processDocument
);

// Endpoint for the Python service to call back to
router.post(
  "/callback/:processingId",
  validate(callbackSchema),
  documentProcessingCallback
);

// Endpoint for the frontend to poll for status
router.get(
  "/status/:processingId",
  authenticateJWT,
  getDocumentProcessingStatus
);

export { router as documentRoutes };
