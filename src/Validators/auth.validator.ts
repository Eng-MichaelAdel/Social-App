import * as z from "zod";
import { generalValidators } from "./general.validator";

export const sighnUpSchema = {
  body: z.object({
    id: generalValidators.user.shape.id,
    firstName: generalValidators.user.shape.firstName,
    lastName: generalValidators.user.shape.lastName,
    email: generalValidators.user.shape.email,
    password: generalValidators.user.shape.password,
    confirmedPassword: generalValidators.user.shape.confirmedPassword,
    phone: generalValidators.user.shape.phone,
    gender: generalValidators.user.shape.gender,
    role: generalValidators.user.shape.role,
    DOB: generalValidators.user.shape.DOB,
  }),
};

export type TsighnUpBody = z.infer<typeof sighnUpSchema.body>;
