import { Request, Response } from "express";
import db from "../db/db";

export const createSubDistrict = async (req: Request, res: Response) => {
  try {
    const { name, districtId } = req.body;

    const subDistrict = await db.subDistrict.create({
      data: {
        name,
        districtId,
      },
    });

    return res.status(201).json(subDistrict);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create sub-district" });
  }
};

export const getSubDistricts = async (req: Request, res: Response) => {
  try {
    const subDistricts = await db.subDistrict.findMany();
    return res.status(200).json(subDistricts);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve sub-districts" });
  }
};

export const getSubDistrictById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subDistrict = await db.subDistrict.findUnique({ where: { id } });
    if (!subDistrict) {
      return res.status(404).json({ message: "Sub-district not found" });
    }
    return res.status(200).json(subDistrict);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve sub-district" });
  }
};

export const updateSubDistrict = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, districtId } = req.body;

    const subDistrict = await db.subDistrict.update({
      where: { id },
      data: {
        name,
        districtId,
      },
    });

    return res.status(200).json(subDistrict);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update sub-district" });
  }
};

export const deleteSubDistrict = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.subDistrict.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete sub-district" });
  }
};
