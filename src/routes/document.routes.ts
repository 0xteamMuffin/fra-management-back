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

router.post(
  "/process",
  authenticateJWT,
  validate(processDocumentSchema),
  processDocument,
);

router.post(
  "/callback/:processingId",
  validate(callbackSchema),
  documentProcessingCallback,
);

router.get(
  "/status/:processingId",
  authenticateJWT,
  getDocumentProcessingStatus,
);

export { router as documentRoutes };
