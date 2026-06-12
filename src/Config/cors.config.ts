import e from "cors";
import { ForbiddenException } from "../Common/index.js";
import envConfig from "./env.config.js";

const whiteListOrigin = envConfig.CORS.cors_whitelist_origin;

export const corsOptions: e.CorsOptions = {
  origin: (origin, callback) => {
    if (whiteListOrigin.includes(origin as string) || !origin) {
      callback(null, true);
    } else {
      callback(new ForbiddenException("CORS policy: Origin not allowed"));
    }
  },
};
