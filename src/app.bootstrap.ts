import express, { Application } from "express";
import { envConfig } from "./Config";

const bootstrap = () => {
  const app: Application = express();












  
  const port: string | number = envConfig.app.PORT;
  app.listen(port, () => {
    console.log(`server is running on port ::: ${port} 🚀🚀`);
  });
};

export default bootstrap;
