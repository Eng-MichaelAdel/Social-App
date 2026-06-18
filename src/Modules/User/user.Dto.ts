import z from "zod";
import { SharedProfileSchema, updatePasswordSchema, updateProfileShcema } from "../../Validators";

export type TUpdateProfileShcemaDto = z.infer<typeof updateProfileShcema.body>;
export type TUpdatePasswordSchemaDto = z.infer<typeof updatePasswordSchema.body>;
export type TSharedProfileSchemaDto = z.infer<typeof SharedProfileSchema.params>;