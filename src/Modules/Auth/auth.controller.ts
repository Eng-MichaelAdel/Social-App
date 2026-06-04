import { Router } from "express";
import authService from "./auth.service";
import { successResponse } from "../../Common";
import { validation } from "../../Middlewares";
import { signUpSchema } from "../../Validators";
// import { ILoginResponse } from "./auth.entity";

const router = Router();

router.post("/signup", validation(signUpSchema), async (req, res, next): Promise<any> => {
  const data = await authService.signup(req.body);
  return successResponse({ res, data });
});

export default router;
