import dotenv from "dotenv";
dotenv.config();

import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";

import authRoute from "./routes/auth";
import claimRoute from "./routes/claim";
import winnerRoute from "./routes/winner";
import wordsRoute from "./routes/words";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`, req.body);
  next();
});

app.use("/auth", authRoute);
app.use("/claim-check", claimRoute);
app.use("/winner", winnerRoute);
app.use("/words", wordsRoute);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "👋 Welcome to the Riddle Backend API!",
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `The route ${req.originalUrl} does not exist.`,
  });
});

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});

export default app;
