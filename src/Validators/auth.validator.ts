import * as z from "zod";
import { generalValidators } from "./general.validator";

const signUpBodyBase = z.strictObject({
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
});

export const signUpSchema = {
  body: signUpBodyBase.refine((data) => data.password === data.confirmedPassword, {
    path: ["confirmedPassword"],
    message: "Password and Confirmed Password must match",

    when(payload) {
      return signUpBodyBase
        .pick({
          password: true,
          confirmedPassword: true,
        })
        .safeParse(payload.value).success;
    },
  }),
};

export type TsighnUpBody = z.infer<typeof signUpBodyBase>;
