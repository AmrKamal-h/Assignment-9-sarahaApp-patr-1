import { userModel } from "../../DB/models/user.model.js"
import { decodeToken, tokenEnum } from "../../Middlewares/auth.middleware.js"
import { comparHash, createHash } from "../../security/hash.js"
import { errorRes } from "../../Utils/error.handel.js"
import jwt from "jsonwebtoken"
import {OAuth2Client} from "google-auth-library"
import { ProviderEnum } from "./user.types.js"
import { successRes } from "../../Utils/success.res.js"
import { random } from "../../Utils/email/createOtp.js"
import { sendEmail } from "../../Utils/email/sendEmail.js"
import { emailTemplate } from "../../Utils/email/emailTemplate.js"

const googleClient = new OAuth2Client();

// Signup Service
export const signupService =async ({fullName,email,password, gender,age,phone , bio,userName})=>{
    const isExist =  await userModel.findOne({
        $or: [
            { email },
            { userName }
        ]
    })  
    
    if(isExist){
        return errorRes({
            msg:`${isExist.email == email ? "email": "username"} alredy exist`,
            statusCode:400
        })
    } 
    const otp = random()
  
    
    const user = await userModel.create({
        fullName,
        email,
        password:await createHash(password),
        gender,
        age,
        phone ,
        bio,
        userName,
        otp:{
            code: await createHash(otp),                 
            expireIn: Date.now() + 5 * 60 * 1000
        }
    })
      await sendEmail ({
        to: email,
        subject :"Confirm Email",
        html : emailTemplate({
            otp,
            subject : "Confirm Email"
        })
    })
    return{
        data:{
            user
        }
    }

}


// login service
export const loginService = async (identifier, password) => {
    const user = await userModel.findOne({
        $or: [
            { email: identifier },
            { userName: identifier },
        ]
    })
    if (!user) {
        return errorRes({
            msg: "invalid credentials",
            statusCode: 400
        })
    }
    const isPasswordMatch = await comparHash(password, user.password)
    if (!isPasswordMatch) {
        return errorRes({
            msg: "invalid credentials",
            statusCode: 400
        })
    }
    if (!user.confirmedAt) {
        return errorRes({
            msg: "please confirm your email first",
            statusCode: 401
        })
    }

    const accessToken = jwt.sign({
        _id: user._id,
        email: user.email
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "30Min"
    })

    const refreshToken = jwt.sign({
        _id: user._id,
        email: user.email
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d"
    })

    return {
        data: {
            accessToken,
            refreshToken
        }
    }
}

// Refresh Token FN
export const refreshToken = async(authorization)=>{
     const {user} = await decodeToken({authorization ,tokenType: tokenEnum.refresh})
     const accessToken = jwt.sign({
        _id: user._id,
        email: user.email
     },process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:"30s"
     })

     return {
        data: {
            accessToken
        }
     }
}

// Google login service
export const googleLogin = async (token) => {
  const ticket = await googleClient.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID,
  });

  const { email, name, picture } = ticket.getPayload();

  let user = await userModel.findOne({ email });
  if (user) {
    if (user.provider != ProviderEnum.google) {
       errorRes({
        msg: "use your provider",
        statusCode: 404,
      });
    }
  } else {
    user = await userModel.create({
      email,
      userName: name,
      profilePicture: picture,
      provider: ProviderEnum.google,
      confirmed: true,
    });
  }

  const accessToken = jwt.sign(
    { _id: user._id, email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "30Min" }
  );

  const refreshToken = jwt.sign(
    { _id: user._id, email: user.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return {
    data: {
      accessToken,
      refreshToken,
    },
  };
};


//  Confirm Email Service 
export const confirmEmail =async ({email, otp})=>{
    const user = await userModel.findOne({
        email, confirmedAt :{
            $exists: false
        }
    })

    if(!user ){
        errorRes({
            msg: "in_valid Credentials",
            statusCode: 404
        })
    }
    await checkOtp(user ,otp)
     user.confirmedAt = new Date() 
    user.otp = undefined 
    await user.save()
    return {
        data:{

        }
    }
}


// Forget Password 
export const forgetPasswordSendOtp = async(email)=>{
    const user = await userModel.findOne({email})
    if(!user){
      return
    }

    if(user.otp.expireIn > Date.now()){
        return
    }

    const otp = random(6)
    user.otp.code = await createHash(otp)
    user.otp.expireIn = Date.now() + 5 * 60 * 1000
    await user.save()
    sendEmail({
        to:email,
        subject: "Forget Password",
        html: emailTemplate({
            otp,
            subject: "Forget Password"
        })
    })
     
    return {
        data:{}
    }
}



// Reset Password 
export const resetPassword = async(email , otp , password)=>{
    const user = await userModel.findOne({email})
        if(!user ){
        errorRes({
            msg: "in_valid Credentials",
            statusCode: 404
        })
    }
    await checkOtp(user , otp)
    user.password = await createHash(password)
    await user.save()

    return {
        data:{}
    }
}


// Check OTP FN 

export const checkOtp = async ( user , otp)=>{
      if (!user.otp || user.otp.expiresIn < Date.now()){
         errorRes({
            msg: "OTP Expired",
            statusCode: 404
        })
    }
    if(!await comparHash(otp , user.otp.code)){
        errorRes({
            msg:"in-valid OTP",
            statusCode: 400
        })
    }
}