import { Request, Response } from "express";
import db from "../db/db";

export const createFRAClaim = async (req: Request, res: Response) => {
  try {
    const { type, claimantName, claimantAadhaar, villageId, geoBoundary } =
      req.body;

    const claim = await db.$queryRaw`
      INSERT INTO "FRAClaim" (id, type, "claimantName", "claimantAadhaar", "villageId", "geoBoundary", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${type}, ${claimantName}, ${claimantAadhaar}, ${villageId}, ST_GeomFromGeoJSON(${geoBoundary}), NOW(), NOW())
      RETURNING *;
    `;

    return res.status(201).json(claim);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create FRA claim" });
  }
};

export const getFRAClaims = async (req: Request, res: Response) => {
  try {
    const claims = await db.fRAClaim.findMany();
    return res.status(200).json(claims);
  } catch (error) {
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
