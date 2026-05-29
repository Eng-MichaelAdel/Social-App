import { config } from "dotenv";

config({ path: [`.env.${process.env.NODE_ENV}`, ".env"] });

const envConfig = {
  app: {
    PORT: process.env.PORT ?? 3000,
    NODE_ENV: process.env.NODE_ENV,
  },
};

export default envConfig;
