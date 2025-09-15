import { z } from "zod";

export const createFRAClaimSchema = z.object({
  body: z.object({
    type: z.enum(["IFR", "CR", "CFR"]),
    claimantName: z.string().min(1, "Claimant name is required"),
    claimantAadhaar: z.string().optional(),
    villageId: z.string().uuid("Invalid village UUID"),
    geoBoundary: z.string().optional(), // Expecting a GeoJSON string
  }),
});

export const updateFRAClaimSchema = z.object({
  body: z.object({
    type: z.enum(["IFR", "CR", "CFR"]).optional(),
    claimantName: z.string().min(1, "Claimant name is required").optional(),
    claimantAadhaar: z.string().optional(),
    villageId: z.string().uuid("Invalid village UUID").optional(),
    geoBoundary: z.string().optional(),
    status: z.enum(["Pending", "Verified", "Granted", "Rejected"]).optional(),
  }),
  params: z.object({
    id: z.string().uuid("Invalid UUID"),
  }),
});
