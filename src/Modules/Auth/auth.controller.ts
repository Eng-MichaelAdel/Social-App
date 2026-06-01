import { Router } from "express";
import authService from "./auth.service";
import { successResponse } from "../../Common";
// import { ILoginResponse } from "./auth.entity";

const router = Router();

router.post("/signup", async (req, res, next): Promise<any> => {
  const data = await authService.signup(req.body);
  return successResponse({ res, data });
});

export default router;
