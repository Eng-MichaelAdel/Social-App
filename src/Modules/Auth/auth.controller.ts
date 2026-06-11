import { Router } from "express";
import authService from "./auth.service";
import { successResponse } from "../../Common";
import { Authentication, validation } from "../../Middlewares";
import { confirmEmail, loginSchema, resendConfirmEmail, resetForgotPassword, signUpSchema } from "../../Validators";
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

//* login
router.post("/login", validation(loginSchema), async (req, res, next) => {
  const issuer = `${req.protocol}://${req.host}`;
  const Token = await authService.login(req.body, issuer);
  successResponse({ res, message: "Login Successfully", data: { Token } });
});

// * Refresh Token
router.post("/refreshToken", Authentication, async (req, res, next) => {
  const issuer = `${req.protocol}://${req.host}`;
  const Token = await authService.refreshTokenService(req.decode, issuer);
  successResponse({ res, message: "Token Refreshed Successfully", data: { Token } });
});

//* Request ForgotPassword Code
router.post("/request-forgetPassword-code", validation(resendConfirmEmail), async (req, res, next) => {
  await authService.requestForgetPasswordCode(req.body);
  successResponse({ res, message: "reset Code is sent ,, Please check your email" });
});

//* Verify ForgotPassword Code
router.patch("/verify-forgetPassword-code", validation(confirmEmail), async (req, res, next) => {
  await authService.verifyForgetPasswordCode(req.body);
  successResponse({ res, message: "the Code is Verified" });
});

//* Reset ForgotPassword
router.put("/reset-forgetPassword", validation(resetForgotPassword), async (req, res, next) => {
  await authService.resetForgetPassword(req.body);
  successResponse({ res, message: "your password is reset" });
});

//* Logout
router.post("/logout", Authentication, async (req, res, next) => {
  const message = await authService.logoutService({
    userAccount: req.user,
    accessDecodedData: req.decode,
    refreshToken: req.headers.refreshtoken ,
    logoutFromAll: req.body.logoutFromAll,
  });
  successResponse({ res, message });
});
export default router;
