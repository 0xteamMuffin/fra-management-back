import { Request, Response } from "express";
import db from "../db/db";

export const trackClaimStatus = async (req: Request, res: Response) => {
  try {
    const { claimId } = req.params;

    if (!claimId) {
      return res.status(400).json({ message: "Claim ID is required" });
    }

    const claim = await db.fRAClaim.findUnique({
      where: { id: claimId },
      select: {
        id: true,
        status: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        village: {
          select: {
            name: true,
            district: {
              select: {
                name: true,
                state: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    // Return a simplified object for public view
    const publicClaimDetails = {
      id: claim.id,
      status: claim.status,
      type: claim.type,
      submittedDate: claim.createdAt,
      lastUpdate: claim.updatedAt,
      location: `${claim.village.name}, ${claim.village.district.name}, ${claim.village.district.state.name}`,
    };

    return res.status(200).json(publicClaimDetails);
  } catch (error) {
    console.error("Error tracking claim status:", error);
    return res.status(500).json({ message: "Failed to track claim status" });
  }
};
