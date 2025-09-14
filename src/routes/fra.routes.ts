import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.middleware";
import { Request, Response } from "express";

const router = Router();

// only GramSabha and higher can verify FRA claims
router.post(
  "/verify/:id",
  authenticateJWT,
  authorizeRoles(["GramSabha", "SubDivisionalCommittee", "DistrictCommittee"]),
  (req: Request, res: Response) => {
    return res.json({ message: "Claim verified" });
  }
);

// only District Committee can approve final claims
router.post(
  "/approve/:id",
  authenticateJWT,
  authorizeRoles(["DistrictCommittee"]),
  (req: Request, res: Response) => {
    return res.json({ message: "Claim approved" });
  }
);

export { router as fraRoutes };
