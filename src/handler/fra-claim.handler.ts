import { Request, Response } from "express";
import db from "../db/db";
import { AuthRequest } from "../middleware/auth.middleware";

export const createFRAClaim = async (req: AuthRequest, res: Response) => {
  try {
    const { familyMembers, evidence, ...claimData } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const result = await db.$transaction(async (prisma) => {
      const newClaim = await prisma.fRAClaim.create({
        data: {
          ...claimData,
          createdByUserId: userId, // Associate the claim with the user
        },
      });

      if (familyMembers && familyMembers.length > 0) {
        await prisma.familyMember.createMany({
          data: familyMembers.map((member: any) => ({
            ...member,
            fraClaimId: newClaim.id,
          })),
        });
      }

      if (evidence && evidence.length > 0) {
        await prisma.evidence.createMany({
          data: evidence.map((ev: any) => ({
            ...ev,
            fraClaimId: newClaim.id,
          })),
        });
      }

      return newClaim;
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create FRA claim" });
  }
};

export const getFRAClaims = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    let whereClause: any = {};

     // Tailor the query based on user role
     switch (user.role) {
       case 'VillagePerson':
         whereClause.createdByUserId = user.id;
         break;
       case 'GramSabha':
         whereClause.currentStage = 'GramSabha';
         break;
       case 'SubDivisionalCommittee':
         whereClause.currentStage = 'SubDivisionalCommittee';
         break;
       case 'DistrictCommittee':
         whereClause.currentStage = 'DistrictCommittee';
         break;
       default:
         return res.status(403).json({ message: "Forbidden: User role cannot view claims" });
     }

    const claims = await db.fRAClaim.findMany({
      where: whereClause,
      include: {
        village: true,
        familyMembers: true,
        evidence: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
    return res.status(200).json(claims);
  } catch (error) {
    console.error("Error retrieving claims:", error);
    return res.status(500).json({ message: "Failed to retrieve FRA claims" });
  }
};

export const getFRAClaimById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const claim = await db.fRAClaim.findUnique({ where: { id } });
    if (!claim) {
      return res.status(404).json({ message: "FRA claim not found" });
    }
    return res.status(200).json(claim);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve FRA claim" });
  }
};

export const updateFRAClaim = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, claimantName, claimantAadhaar, villageId, geoBoundary, status } =
      req.body;

    const claim = await db.$queryRaw`
      UPDATE "FRAClaim"
      SET 
        type = COALESCE(${type}, type),
        "claimantName" = COALESCE(${claimantName}, "claimantName"),
        "claimantAadhaar" = COALESCE(${claimantAadhaar}, "claimantAadhaar"),
        "villageId" = COALESCE(${villageId}, "villageId"),
        "geoBoundary" = COALESCE(ST_GeomFromGeoJSON(${geoBoundary}), "geoBoundary"),
        status = COALESCE(${status}, status),
        "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING *;
    `;

    return res.status(200).json(claim);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update FRA claim" });
  }
};

export const deleteFRAClaim = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.fRAClaim.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete FRA claim" });
  }
};

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
