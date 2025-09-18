import { Router } from "express";
import { getPresignedUrl, getPresignedViewUrl } from "../handler/s3.handler";
import { authenticateJWT } from "../middleware/auth.middleware";

const router = Router();

router.post("/presigned-url", authenticateJWT, getPresignedUrl);
router.get("/view-url", authenticateJWT, getPresignedViewUrl);

export { router as s3Routes };
