import { ISuccessResponse } from "../../Types";

const successResponse = ({ res, message = "Done", status = 200, data }: ISuccessResponse) => {
  return res.status(status).json({
    success: true,
    message,
    status,
    data,
  });
};

export default successResponse;
