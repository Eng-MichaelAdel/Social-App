import z from "zod";
import { updateProfileShcema } from "../../Validators";

export type TUpdateProfileShcemaDto = z.infer<typeof updateProfileShcema.body>;