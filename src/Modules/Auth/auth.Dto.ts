import z from "zod";
import { confirmEmail, loginSchema, resendConfirmEmail, resetForgotPassword, signUpBodyBase } from "../../Validators";

export type TsighnUpDto = z.infer<typeof signUpBodyBase>;
export type TConfirmEmailDto = z.infer<typeof confirmEmail.body>;
export type TResendConfirmEmailDto = z.infer<typeof resendConfirmEmail.body>;
export type TLoginSchemaDto = z.infer<typeof loginSchema.body>;
export type TResetForgotPasswordDto = z.infer<typeof resetForgotPassword.body>;
