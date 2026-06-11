import z from "zod";
import { confirmEmail, loginSchema, resendConfirmEmail, resetForgotPassword, signUpBodyBase } from "../../Validators";
import { IUser } from "../../Common";
import { JwtPayload } from "jsonwebtoken";
import { HydratedDocument } from 'mongoose';

export type TsighnUpDto = z.infer<typeof signUpBodyBase>;
export type TConfirmEmailDto = z.infer<typeof confirmEmail.body>;
export type TResendConfirmEmailDto = z.infer<typeof resendConfirmEmail.body>;
export type TLoginSchemaDto = z.infer<typeof loginSchema.body>;
export type TResetForgotPasswordDto = z.infer<typeof resetForgotPassword.body>;
export type TLogoutServiceDto = {
  userAccount: HydratedDocument<IUser>;
  accessDecodedData: JwtPayload;
  refreshToken: string | string[] | undefined;
  logoutFromAll: boolean;
};
