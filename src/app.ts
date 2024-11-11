import express from "express";
import mediaRoutes from "./routes/mediaRoutes";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/api/media", mediaRoutes);

export default app;
