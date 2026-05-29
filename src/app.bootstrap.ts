import express, { Application } from "express";
import { envConfig } from "./Config";
import { authRouter, commentRouter, postRouter, userRouter } from "./Modules";

const bootstrap = () => {
  const app: Application = express();

  //function to handle middlewares
  function initializeCommonMiddlewares(app: Application) {
    // parse body to JSON
    app.use(express.json());
  }

  //function to initialize application routing
  function initilaizeAppRouting(app: Application) {
    // project routers
    app.use("/auth", authRouter);
    app.use("/user", userRouter);
    app.use("/post", postRouter);
    app.use("/comment", commentRouter);

    // not found router
    app.use("{/*dummy}", (req, res, next) => {
      return res.status(404).json({ message: "invalid application routing" });
    });

    // check router
    app.get("/", (req, res, next) => {
      return res.json({ message: "welcome to social App" });
    });
  }

  initializeCommonMiddlewares(app);
  initilaizeAppRouting(app);

  const port: string | number = envConfig.app.PORT;
  app.listen(port, () => {
    console.log(`server is running on port ::: ${port} 🚀🚀`);
  });
};

export default bootstrap;
