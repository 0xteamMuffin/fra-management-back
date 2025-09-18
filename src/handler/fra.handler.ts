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

export const forwardClaim = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const claim = await db.fRAClaim.findUnique({ where: { id } });

    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    let nextStatus = claim.status;
    let nextStage = claim.currentStage;

    if (claim.currentStage === "GramSabha" && user.role === "GramSabha") {
      nextStatus = "Verified";
      nextStage = "SubDivisionalCommittee";
    } else if (
      claim.currentStage === "SubDivisionalCommittee" &&
      user.role === "SubDivisionalCommittee"
    ) {
      nextStage = "DistrictCommittee";
    } else {
      return res
        .status(400)
        .json({ message: "Claim is not in a forwardable state for your role" });
    }

    const updatedClaim = await db.fRAClaim.update({
      where: { id },
      data: {
        status: nextStatus,
        currentStage: nextStage,
        remarks: remarks
          ? `${claim.remarks || ""}\n[${new Date().toISOString()}] [${user.role}]: ${remarks}`
          : claim.remarks,
      },
    });

    return res.status(200).json(updatedClaim);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to forward claim" });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let stats = {};

    switch (user.role) {
      case "GramSabha":
        const pending = await db.fRAClaim.count({
          where: { currentStage: "GramSabha" },
        });
        const forwardedToSdlc = await db.fRAClaim.count({
          where: { currentStage: "SubDivisionalCommittee" },
        });
        stats = { pending, forwardedToSdlc };
        break;

      case "SubDivisionalCommittee":
        const toReviewSdlc = await db.fRAClaim.count({
          where: { currentStage: "SubDivisionalCommittee" },
        });
        const forwardedToDlc = await db.fRAClaim.count({
          where: { currentStage: "DistrictCommittee" },
        });
        stats = { toReviewSdlc, forwardedToDlc };
        break;

      case "DistrictCommittee":
        const toReviewDlc = await db.fRAClaim.count({
          where: { currentStage: "DistrictCommittee", status: "Verified" },
        });
        const granted = await db.fRAClaim.count({
          where: { status: "Granted" },
        });
        const rejected = await db.fRAClaim.count({
          where: { status: "Rejected" },
        });
        stats = { toReviewDlc, granted, rejected };
        break;

      default:
        return res.status(200).json({});
    }

    return res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

export const rejectClaim = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!reason) {
      return res
        .status(400)
        .json({ message: "A reason for rejection is required" });
    }

    const updatedClaim = await db.fRAClaim.update({
      where: { id },
      data: {
        status: "Rejected",
        approvedByUserId: userId,
        otherRelevantInfo: reason,
      },
    });

    return res.status(200).json(updatedClaim);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to reject claim" });
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
