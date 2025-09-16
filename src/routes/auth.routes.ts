import { Router } from "express";
import { login, signup } from "../handler/auth.handler";
import { validate } from "../middleware/validate.middleware";
import { loginSchema, signupSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);

export { router as authRoutes };
