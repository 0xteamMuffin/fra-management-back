import { Router } from "express";
import { login, signup, getMe } from "../handler/auth.handler";
import { validate } from "../middleware/validate.middleware";
import { loginSchema, signupSchema } from "../schemas/auth.schema";
import { authenticateJWT } from "../middleware/auth.middleware";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticateJWT, getMe);

export { router as authRoutes };
