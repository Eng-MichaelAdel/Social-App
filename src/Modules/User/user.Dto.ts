import z from "zod";
import { updatePasswordSchema, updateProfileShcema } from "../../Validators";

export type TUpdateProfileShcemaDto = z.infer<typeof updateProfileShcema.body>;
export type TUpdatePasswordSchemaDto = z.infer<typeof updatePasswordSchema.body>;