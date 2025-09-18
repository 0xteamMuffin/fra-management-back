import { Router } from "express";
import {
  createSubDistrict,
  deleteSubDistrict,
  getSubDistrictById,
  getSubDistricts,
  updateSubDistrict,
} from "../handler/sub-district.handler";

const subDistrictRouter = Router();

subDistrictRouter.post("/", createSubDistrict);
subDistrictRouter.get("/", getSubDistricts);
subDistrictRouter.get("/:id", getSubDistrictById);
subDistrictRouter.put("/:id", updateSubDistrict);
subDistrictRouter.delete("/:id", deleteSubDistrict);

export default subDistrictRouter;
