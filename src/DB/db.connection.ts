import { envConfig } from "../Config";
import mongoose from "mongoose";

const dbConnetion = async () => {
  try {
    const URI: string = envConfig.DB.URI;
    await mongoose.connect(URI);
    console.log(`Database is connected Seccesfully ❤️`);
  } catch (error) {
    console.log("Unable to connect to the database 😢", error);
  }
};

export default dbConnetion;
