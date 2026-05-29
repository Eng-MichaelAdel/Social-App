import { Router } from "express";
import authService from "./auth.service";

const router = Router();

router.post("/login", (req, res, next) => {
  const data = authService.login(req.body);
  return res.status(200).json({ message: "login successfully 2", data });
});

export default router