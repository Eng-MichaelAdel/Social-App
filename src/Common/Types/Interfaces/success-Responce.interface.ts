import { Response } from "express";

export interface ISuccessResponse{
  res: Response;
  message?: string;
  status?: number;
  data?:any;
}