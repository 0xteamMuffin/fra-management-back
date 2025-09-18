import { z } from "zod";

const familyMemberSchema = z.object({
  name: z.string().min(1, "Family member name is required"),
  age: z.number().int().positive("Age must be a positive number"),
  relationship: z.string().min(1, "Relationship is required"),
});

const evidenceSchema = z.object({
  s3Key: z.string().min(1, "Evidence S3 key is required"),
  category: z.string().min(1, "Evidence category is required"),
});

export const createFRAClaimSchema = z.object({
  body: z.object({
    claimantName: z.string().min(1, "Claimant name is required"),
    spouseName: z.string().optional(),
    fatherOrMotherName: z.string().optional(),
    fullResidentialAddress: z.string().optional(),
    villageName: z.string().optional(),
    gramPanchayat: z.string().optional(),
    tehsil: z.string().optional(),
    district: z.string().optional(),
    claimantCategory: z.enum(["ST", "OTFD"]),
    casteOrTribeCertificateS3Key: z.string().optional(),
    familyMembers: z.array(familyMemberSchema).optional(),

    claimedRights: z.any(),

    evidence: z
      .array(evidenceSchema)
      .min(2, "At least two forms of evidence are required"),

    otherRelevantInfo: z.string().optional(),
    applicantSignatureOrThumbS3Key: z.string().optional(),

    villageId: z.string().uuid("Invalid village UUID"),
    type: z.enum(["IFR", "CR", "CFR"]),
  }),
});

export const updateFRAClaimSchema = z.object({});
