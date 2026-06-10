import { Router } from "express";
import authService from "./auth.service";
import { successResponse } from "../../Common";
import { validation } from "../../Middlewares";
import { confirmEmail, resendConfirmEmail, signUpSchema } from "../../Validators";
// import { ILoginResponse } from "./auth.entity";

const router = Router();

//* signup
router.post("/signup", validation(signUpSchema), async (req, res, next): Promise<any> => {
  const user = await authService.signup(req.body);
  return successResponse({ res, status: 201, message: "user added successfully", data: user });
});

// * verifyEmail
router.patch("/confirm-email", validation(confirmEmail), async (req, res, next) => {
  await authService.verifyEmailService(req.body);
  successResponse({ res, message: "your email is confirmed" });
});

//* Resend Verify Email
router.post("/resend-confirm-email", validation(resendConfirmEmail), async (req, res, next) => {
  await authService.resendRerifyEmailService(req.body);
  successResponse({ res, message: "Verification Code is sent ,, Please check your email" });
});



export default router;
