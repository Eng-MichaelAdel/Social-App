import envConfig from "../../../Config/env.config.js";

const envEmail = envConfig.EMAIL;
const NODE_ENV = envConfig.app.NODE_ENV;

export const emailConfig = {
  service: envEmail.service,
  auth: {
    user: envEmail.user,
    pass: envEmail.password,
  },
  tls: {
    rejectUnauthorized: NODE_ENV === "development" ? false : true,
  },
};
