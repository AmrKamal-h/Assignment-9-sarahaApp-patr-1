import chalk from "chalk";
import mongoose from "mongoose";

export const DBConnection = async ()=>{
    try {
        await mongoose.connect(process.env.DB_URL,{
            serverSelectionTimeoutMS:5000
        })
        console.log(chalk.green("DB Connected successfully"));
    } catch (error) {
        console.log(chalk.green("DB connection failed "), error);
        
    }
}