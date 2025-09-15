import { Request, Response } from "express";
import db from "../db/db";

export const createState = async (req: Request, res: Response) => {
  try {
    const { name, code } = req.body;

    const existingState = await db.state.findUnique({ where: { code } });
    if (existingState) {
      return res.status(400).json({ message: "State code already exists" });
    }

    const state = await db.state.create({
      data: { name, code },
    });
    return res.status(201).json(state);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create state" });
  }
};

export const getStates = async (req: Request, res: Response) => {
  try {
    const states = await db.state.findMany();
    return res.status(200).json(states);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve states" });
  }
};

export const getStateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const state = await db.state.findUnique({ where: { id } });
    if (!state) {
      return res.status(404).json({ message: "State not found" });
    }
    return res.status(200).json(state);
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve state" });
  }
};

export const updateState = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    const state = await db.state.update({
      where: { id },
      data: { name, code },
    });
    return res.status(200).json(state);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update state" });
  }
};

export const deleteState = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.state.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete state" });
  }
};
