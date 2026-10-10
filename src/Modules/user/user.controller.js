// user controller
import { Router } from "express";
import { successRes } from "../../Utils/success.res.js";
import { loginService, refreshToken, signupService } from "./user.services.js";
import { auth, authorization } from "../../Middlewares/auth.middleware.js";
import { RoleEnum } from "./user.types.js";
import { signupSchema } from "./user.validation.js";
import { errorRes } from "../../Utils/error.handel.js";
import { validation } from "../../Middlewares/validation.middleware.js";

const router = Router()

export const routes ={
    base:"/users",
    signup: "/signup",                //POST
    login:"/login",                   //POST  
    me: "/me",                        //GET
    refreshToken:"/refresh-token",    //POST    
}

    // Signup Api
    router.post(routes.signup,validation(signupSchema),async (req,res)=>{
        const {data} = await signupService(req.body)
        return successRes({
            res,
            status:201,
            msg:"created"
        })
    })

    // login Api
    router.post(routes.login, async (req,res)=>{
        const {identifier, password} = req.body
        const {data} = await loginService(identifier,password)
        return successRes({res,data})
    })

    // Profile Api
    router.get(routes.me, auth, authorization(RoleEnum.user) ,async (req,res)=>{

        const user = req.user
        successRes({
            res, data: {user}
        })
    })


    // RefreshToken Api
    router.post(routes.refreshToken,async(req,res)=>{
          const authorization = req.headers.authorization
          const {data} = await refreshToken(authorization) 
          successRes({
            res,
            data
          })        
    })

export default router