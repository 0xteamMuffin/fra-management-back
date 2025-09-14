import { Router } from "express";
import { login, signup } from "../handler/auth.handler";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);

export { router as authRoutes };
