import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { apiRouter } from "./api";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api", apiRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});