import { Router } from "express";
import { authRoutes } from "./routes/auth.routes";
import { fraRoutes } from "./routes/fra.routes";
import { stateRoutes } from "./routes/state.routes";
import { districtRoutes } from "./routes/district.routes";
import { villageRoutes } from "./routes/village.routes";
import { fraClaimRoutes } from "./routes/fra-claim.routes";
import { s3Routes } from "./routes/s3.routes";
import { documentRoutes } from "./routes/document.routes";
import { segmentationRoutes } from "./routes/seg.routes";
import { adminRoutes } from "./routes/admin.routes";
import { setupRoutes } from "./routes/setup.routes";
import subDistrictRouter from "./routes/sub-district.routes";

const router = Router();

// Public setup routes (no auth required)
router.use("/setup", setupRoutes);

// v1 API routes
router.use(
  "/v1",
  Router()
    .use("/auth", authRoutes)
    .use("/fra", fraRoutes)
    .use("/states", stateRoutes)
    .use("/districts", districtRoutes)
    .use("/sub-district", subDistrictRouter)
    .use("/villages", villageRoutes)
    .use("/claims", fraClaimRoutes)
    .use("/s3", s3Routes)
    .use("/analysis", segmentationRoutes)
    .use("/documents", documentRoutes)
    .use("/admin", adminRoutes)
);

export { router as apiRouter };
