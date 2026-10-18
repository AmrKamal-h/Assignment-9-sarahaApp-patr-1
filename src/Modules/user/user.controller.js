// user controller
import { Router } from "express";
import { successRes } from "../../Utils/success.res.js";
import { confirmEmail, forgetPasswordSendOtp, googleLogin, loginService, refreshToken, resetPassword, signupService } from "./user.services.js";
import { auth, authorization } from "../../Middlewares/auth.middleware.js";
import { RoleEnum } from "./user.types.js";
import { resetPasswordSchema, signupSchema } from "./user.validation.js";
import { errorRes } from "../../Utils/error.handel.js";
import { validation } from "../../Middlewares/validation.middleware.js";
import multer from "multer";
import { uploadFile } from "../../Utils/multer.js";

const router = Router()

export const routes ={
    base:"/users",
    signup: "/signup",                 //POST
    login:"/login",                    //POST  
    me: "/me",                         //GET
    refreshToken:"/refresh-token",     //POST    
    googleSignup: "/signup/gmail",     //POST
    confirmEmail:"/confirm-email",     //PATCh
    forgetPassword:"/forget-password", //PATCH
    resetPassword:"/reset-password",   //PATCH
    uploadFile: "/upload-file",        //POST
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



    //  Signup With Google
    router.post(routes.googleSignup,async(req,res)=>{
       const {data} =  await googleLogin(req.body.idToken)
        successRes({ res , data })
    })


    // Confirm Email API
    router.patch(routes.confirmEmail, async(req,res)=>{
        const {email , otp} = req.body
        const {data} = await confirmEmail({email , otp})
        successRes({
            res,
            data
        })
    })


    // Forget Password
    router.patch(routes.forgetPassword, async (req,res)=>{
        const {email} = req.body
        await forgetPasswordSendOtp(email)

        return successRes({
            res,
            msg:"otp sent to email if exist"
        })
    })

    // Reset Password
    router.patch(routes.resetPassword,validation(resetPasswordSchema), async (req,res)=>{
        const { email , otp , password} = req.body
        await resetPassword(email , otp , password)


        successRes({
            res
        })
    })

    // Upload File 
    router.get(routes.uploadFile, auth , uploadFile("user").single("image"), async (req,res)=>{

        req.user.profileImage = req.file.path
        await user.save()
        successRes({
            res,
            data: { file: req.file }
        })
    }
)



export default router