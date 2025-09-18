import { Router } from "express";
import { authenticateJWT } from "../middleware/auth.middleware";
import { getDSSSuggestions } from "../handler/dss.handler";

const router = Router();

router.post("/dss", getDSSSuggestions);

export { router as dssRoutes };
