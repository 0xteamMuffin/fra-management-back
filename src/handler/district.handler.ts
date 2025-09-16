import { Request, Response } from "express";
import db from "../db/db";
import { Prisma } from "@prisma/client";

export const createDistrict = async (req: Request, res: Response) => {
  try {
    const { name, code, stateId, boundary } = req.body;

    // Use raw query to handle GeoJSON conversion
    const district = await db.$queryRaw`
      INSERT INTO "District" (id, name, code, "stateId", boundary, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${name}, ${code}, ${stateId}, ST_GeomFromGeoJSON(${boundary}), NOW(), NOW())
      RETURNING *;
    `;

    return res.status(201).json(district);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create district" });
  }
};

export const getDistricts = async (req: Request, res: Response) => {
  try {
    const districts = await db.district.findMany();
    return res.status(200).json(districts);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve districts" });
  }
};

export const getDistrictById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const district = await db.district.findUnique({ where: { id } });
    if (!district) {
      return res.status(404).json({ message: "District not found" });
    }
    return res.status(200).json(district);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve district" });
  }
};

export const updateDistrict = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, stateId, boundary } = req.body;

    let updateData: Prisma.DistrictUpdateInput = { name, code };
    if (stateId) {
      updateData.state = { connect: { id: stateId } };
    }

    if (boundary) {
      // Use raw query for updates involving geometry
      const updatedDistrict = await db.$queryRaw`
        UPDATE "District"
        SET name = ${name}, code = ${code}, "stateId" = ${stateId}, boundary = ST_GeomFromGeoJSON(${boundary}), "updatedAt" = NOW()
        WHERE id = ${id}::uuid
        RETURNING *;
      `;
      return res.status(200).json(updatedDistrict);
    }

    const district = await db.district.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json(district);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update district" });
  }
};


export const deleteDistrict = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.district.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete district" });
  }
};
