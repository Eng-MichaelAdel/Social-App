import { Response } from "express";

export interface ISuccessResponse<T> {
  res: Response;
  message?: string;
  status?: number;
  data?: T;
}