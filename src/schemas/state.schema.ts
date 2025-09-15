import { z } from "zod";

export const createStateSchema = z.object({
  body: z.object({
    name: z.string().min(1, "State name is required"),
    code: z
      .string()
      .min(2, "State code must be 2 characters")
      .max(2, "State code must be 2 characters"),
  }),
});

export const updateStateSchema = z.object({
  body: z.object({
    name: z.string().min(1, "State name is required").optional(),
    code: z
      .string()
      .min(2, "State code must be 2 characters")
      .max(2, "State code must be 2 characters")
      .optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid UUID"),
  }),
});
