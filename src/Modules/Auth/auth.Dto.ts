import z from "zod";
import { confirmEmail, loginSchema, resendConfirmEmail, signUpBodyBase } from "../../Validators";

export type TsighnUpDto = z.infer<typeof signUpBodyBase>;
export type TConfirmEmailDto = z.infer<typeof confirmEmail.body>;
export type TResendConfirmEmailDto = z.infer<typeof resendConfirmEmail.body>;
export type TLoginSchemaDto = z.infer<typeof loginSchema.body>;
