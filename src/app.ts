import express from "express";
import mediaRoutes from "./routes/mediaRoutes";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use("/api/media", mediaRoutes);

export default app;
