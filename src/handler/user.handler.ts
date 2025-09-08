import { Request, Response } from "express";

export const getUser = async (request: Request, response: Response) => {
  try {
    return void response.status(200).json({
      success: true,
    });
  } catch (error: any) {
    console.error("Error fetching questions:", error);
    return void response.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
