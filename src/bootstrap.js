import express from "express"
import chalk from "chalk"
import userRouter, { routes as userRouts } from "./Modules/user/user.controller.js"
import { DBConnection } from "./DB/db.connection.js"
import { userModel } from "./DB/models/user.model.js"
import { GenderEnum } from "./Modules/user/user.types.js"


const bootstrap = async ()=>{
    const app = express()
    const port = 3000

    await DBConnection()
    app.use(express.json())
    app.use(userRouts.base,userRouter)
    

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


    // const user = await userModel.create({
    //     fullName:"Amr Kamal",
    //     userName: "amr11_ahmed",
    //     email: "amr12@example.com",
    //     password: "hashedPassword", // hash it first (e.g. bcrypt.hash)
    //     phone: "01012345678",
    //     age: 22,
    //     gender: GenderEnum.male, // use your enum instead of a raw number
    //     });



    app.use((err,req,res,next)=>{
        const statusCode = err.cause?.statusCode || 500

        res.status(statusCode).json({
            errMsg: err.message,
            status: statusCode
        })
    })

    app.get('/',(req,res)=> res.send("Hello World!"))
    app.listen(port,()=> console.log(chalk.green(`server running on ${port}`))
    )
}


export default bootstrap