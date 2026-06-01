import { config } from "dotenv";

config({ path: [`.env.${process.env.NODE_ENV}`, ".env"] });

const envConfig = {
  app: {
    PORT: process.env.PORT ?? 3000,
    NODE_ENV: process.env.NODE_ENV,
  },
  DB: {
    URI: process.env.URI ?? "mongodb+srv://MaicoAdel:2i7O-21189@cluster0.7hpjxwj.mongodb.net/Social_App",
  },
};

export default envConfig;
