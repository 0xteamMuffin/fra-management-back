import { Router } from "express";
import {
  getAdminStats,
  bulkCreateStates,
  bulkCreateDistricts,
  bulkCreateVillages,
  getAllUsers,
  createUserAdmin,
  deleteUser,
  seedDemoData,
  exportData,
} from "../handler/admin.handler";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

// All admin routes require authentication and DistrictCommittee role (admin)
router.use(authenticateJWT);
router.use(authorizeRoles(["DistrictCommittee"]));

// Dashboard statistics
router.get("/stats", getAdminStats);

// Bulk operations
router.post("/bulk/states", bulkCreateStates);
router.post("/bulk/districts", bulkCreateDistricts);
router.post("/bulk/villages", bulkCreateVillages);

// User management
router.get("/users", getAllUsers);
router.post("/users", createUserAdmin);
router.delete("/users/:userId", deleteUser);

// Data seeding
router.post("/seed", seedDemoData);

// Data export/import
router.get("/export", exportData);
// TODO: Implement import functionality

export { router as adminRoutes };
