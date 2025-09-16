import { Router } from "express";
import { getPresignedUrl } from "../handler/s3.handler";
import { authenticateJWT } from "../middleware/auth.middleware";

const router = Router();

router.post("/presigned-url", authenticateJWT, getPresignedUrl);

export { router as s3Routes };
