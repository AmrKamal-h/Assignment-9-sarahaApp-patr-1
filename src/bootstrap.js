import express from "express"
import chalk from "chalk"
import userRouter, { routes as userRouts } from "./Modules/user/user.controller.js"
import { DBConnection } from "./DB/mongo.connection.js"
import { userModel } from "./DB/models/user.model.js"
import cors from "cors"
import { sendEmail } from "./Utils/email/sendEmail.js"
import { emailTemplate } from "./Utils/email/emailTemplate.js"
import { redisClient } from "./DB/redis.connection.js"
import messageRouter ,  { routes as messageRoutes } from "./Modules/messages/message.controller.js"

const bootstrap = async ()=>{
    const app = express()
    const port = 3000

    await DBConnection()
    app.use(cors({
        origin: "*"
    }
    ))
    app.use(express.json())
    app.use(userRouts.base,userRouter)
    app.use(messageRoutes.base,messageRouter)
    app.use("/uploads",express.static("./uploads"))
    
        // redisClient
    app.get("/u",async (req,res)=>{
        try {
            const user = await userModel.find()
        console.log(user);
    
        res.json({
            user
        })  
        } catch (error) {
            console.log(error);
            
        }
    })




    app.use((err,req,res,next)=>{
        const statusCode = err.cause?.statusCode || 500
        console.log(err.stack)
        res.status(statusCode).json({
            errMsg: err.message,
            status: statusCode,
            errOptions: err.cause?.options
        })
    })

    app.get('/',(req,res)=> res.send("Hello World!"))
    app.listen(port,()=> console.log(chalk.green(`server running on ${port}`))
    )
}


export default bootstrap