import { Router } from "express";
import { getUser } from "../handler/user.handler";

const router = Router();

router.get("/me", getUser);

export { router as userRoutes };
