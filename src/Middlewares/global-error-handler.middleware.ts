import type { NextFunction, Request, Response } from "express";
import { envConfig } from "../Config";
import { IHttpAppError } from "../Common";



const globalErrorHandler = (error: IHttpAppError, req: Request, res: Response, next: NextFunction): Response => {
  const status: number = error.status ?? 500;
  const message: string = error.message;

  const NODE_ENV = envConfig.app.NODE_ENV;
  return res.status(status).json({
    success: false,
    message,
    status,
    cause: error.cause,
    error: {
      type: error.type,
      details: error.details,
    },
    stack: NODE_ENV === "development" ? error.stack : undefined,
  });
};

export default globalErrorHandler;
