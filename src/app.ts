import express from "express";
import mediaRoutes from "./routes/mediaRoutes";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});
app.use(express.json());
app.use("/api/media", mediaRoutes);

export default app;
