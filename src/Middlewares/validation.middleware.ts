import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";
import { BadRequestException } from "../Common";

type RequestKey = keyof Request;
type schemaType = Partial<Record<RequestKey, ZodTypeAny>>;

const validation = (schema: schemaType) => {
  // validation middleware Returns a middleware function that validates the request based on the provided schema
  return (req: Request, res: Response, next: NextFunction) => {
    // initialize the validation errors array
    let validationErrors: any[] = [];

    // iterate over the schema keys and validate the corresponding request data
    for (const key in schema) {
      const validKeys = key as RequestKey;

      // check the availability of schema for the valid key
      const currentSchema = schema[validKeys];

      // if there is no schema for the valid key, continue to the next iteration
      if (!currentSchema) continue;

      // validate the request data using the current schema and collect any validation errors
      const validationResult = currentSchema.safeParse(req[validKeys]);
      if (!validationResult.success) {
        validationErrors.push(...validationResult.error.issues);
      }
    }
    // if there are validation errors, throw a BadRequestException with the error details
    if (validationErrors.length) {
      throw new BadRequestException("validation error", validationErrors);
    }
    next();
  };
};
export default validation;
