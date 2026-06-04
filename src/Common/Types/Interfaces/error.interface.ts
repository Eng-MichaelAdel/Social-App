export interface IHttpAppError extends Error {
  status: number;
  type: string;
  details: unknown;
}