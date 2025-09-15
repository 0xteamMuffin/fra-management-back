import { Request, Response } from "express";
import db from "../db/db";

export const createVillage = async (req: Request, res: Response) => {
  try {
    const { name, districtId, coordinates, boundary } = req.body;

    const village = await db.$queryRaw`
      INSERT INTO "Village" (id, name, "districtId", coordinates, boundary, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${name}, ${districtId}, ST_GeomFromGeoJSON(${coordinates}), ST_GeomFromGeoJSON(${boundary}), NOW(), NOW())
      RETURNING *;
    `;

    return res.status(201).json(village);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create village" });
  }
};

export const getVillages = async (req: Request, res: Response) => {
  try {
    const villages = await db.village.findMany();
    return res.status(200).json(villages);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve villages" });
  }
};

export const getVillageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const village = await db.village.findUnique({ where: { id } });
    if (!village) {
      return res.status(404).json({ message: "Village not found" });
    }
    return res.status(200).json(village);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve village" });
  }
};

export const updateVillage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, districtId, coordinates, boundary } = req.body;

    const village = await db.$queryRaw`
      UPDATE "Village"
      SET 
        name = COALESCE(${name}, name),
        "districtId" = COALESCE(${districtId}, "districtId"),
        coordinates = COALESCE(ST_GeomFromGeoJSON(${coordinates}), coordinates),
        boundary = COALESCE(ST_GeomFromGeoJSON(${boundary}), boundary),
        "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING *;
    `;

    return res.status(200).json(village);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update village" });
  }
};

export const deleteVillage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.village.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete village" });
  }
};
