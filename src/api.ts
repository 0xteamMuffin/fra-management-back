import { Router } from "express";
import { authRoutes } from "./routes/auth.routes";
import { fraRoutes } from "./routes/fra.routes";
import { stateRoutes } from "./routes/state.routes";
import { districtRoutes } from "./routes/district.routes";
import { villageRoutes } from "./routes/village.routes";

const router = Router();

// v1 API routes
router.use(
  "/v1",
  Router()
    .use("/auth", authRoutes)
    .use("/fra", fraRoutes)
    .use("/states", stateRoutes)
    .use("/districts", districtRoutes)
    .use("/villages", villageRoutes)
);

export { router as apiRouter };
