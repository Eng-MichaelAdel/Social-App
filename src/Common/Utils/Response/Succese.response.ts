import { ISuccessResponse } from "../../Interfaces";

const successResponse = <T>({ res, message = "Done", status = 200, data }: ISuccessResponse<T>) => {
  res.status(status).json({
    success: true,
    message,
    status,
    data,
  });
};

export default successResponse;
