import { Router, Request, Response } from "express";
import multer from "multer";
const router = Router();
const upload = multer();

const LAND_SEGMENTATION_API_URL =
  process.env.NODE_ENV === "development"
    ? "http://0.0.0.0:8000"
    : "http://land-segmentation-api:8000";

router.post(
  "/segment",
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const form = new FormData();
    form.append(
      "file",
      new Blob([new Uint8Array(req.file.buffer)]),
      req.file.originalname
    );

    const response = await fetch(`${LAND_SEGMENTATION_API_URL}/segment`, {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: await response.text() });
    }

    res.set("Content-Type", "image/jpeg");
    const buffer = Buffer.from(await response.arrayBuffer());
    res.send(buffer);
  }
);

export { router as segmentationRoutes };
