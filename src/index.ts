import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { authRoutes } from "./routes/auth.routes";
import { fraRoutes } from "./routes/fra.routes";
import { segmentationRoutes } from "./routes/ocr.routes";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/fra", fraRoutes);
app.use("/api/v1/analysis", segmentationRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
