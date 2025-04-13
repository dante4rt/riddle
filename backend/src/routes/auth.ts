import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Admin } from "../models/Admin";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing email or password" });

  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(401).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, admin.passwordHash);
  if (!match) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET!, {
    expiresIn: "2h",
  });
  res.json({ token });
});

export default router;
