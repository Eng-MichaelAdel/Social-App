import { Router } from "express";
import authService from "./auth.service";
import { successResponse } from "../../Common";
import { ILoginResponse } from "./auth.entity";

const router = Router();

router.post("/login", (req, res, next) => {
  const data = authService.login(req.body);
  return successResponse<ILoginResponse>({ res, data });
});

export default router;
