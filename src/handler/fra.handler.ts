import { Response } from "express";
import db from "../db/db";
import { AuthRequest } from "../middleware/auth.middleware";

export const verifyClaim = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updatedClaim = await db.fRAClaim.update({
      where: { id },
      data: {
        status: "Verified",
        verifiedByUserId: userId,
      },
    });

    return res.status(200).json(updatedClaim);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to verify claim" });
  }
};

export const approveClaim = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updatedClaim = await db.fRAClaim.update({
      where: { id },
      data: {
        status: "Granted",
        approvedByUserId: userId,
        grantedAt: new Date(),
      },
    });

    return res.status(200).json(updatedClaim);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to approve claim" });
  }
};
