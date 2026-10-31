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
import { redisClient } from "../../DB/redis.connection.js"
import { attemptsBlockCountKey, attemptsBlockKey, attemptsKey, confirmEmailKey, resendOtpKey, userPrefix, userSessionJwtIdKey, userSessionJwtIdPrefixKey } from "../../Utils/redis-sevices.js"
import { nanoid } from "nanoid"

const calcBlockSecs = (count)=>{
    const Block_Mins_Arr = [5, 15, 60, 1440]
    const index = Math.min(count, Block_Mins_Arr.length)
    return Block_Mins_Arr[index-1]* 60 
}


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
            msg:`${isExist.email == email ? "email": "username"} already exist`,
            statusCode:400
        })
    } 
    const user = await userModel.create({
        fullName,
        email,
        password:await createHash(password),
        gender,
        age,
        phone ,
        bio,
        userName,
   
    })


    const otp = random()
             sendEmail ({
        to: email,
        subject :"Confirm Email",
        html : emailTemplate({
            otp,
            subject : "Confirm Email"
        })
           })
       
      const redisKey = confirmEmailKey(user._id)     
           await redisClient.set(redisKey, await createHash(otp),{
                        expiration: {
                type: "EX",
                value: 5 * 60
            }
           })

           await redisClient.set(resendOtpKey(user.id),0,{
            expiration:{
                type: "EX",
                value: 60
            }
           })
           await redisClient.incr(attemptsKey(user._id))

 
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

    const jwtid = nanoid()

    const accessToken = jwt.sign({
        _id: user._id,
        email: user.email
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "30Min",
        jwtid
    })

    const refreshToken = jwt.sign({
        _id: user._id,
        email: user.email
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
        jwtid
    })

        await redisClient.set(userSessionJwtIdKey(user._id, jwtid), jwtid,{
            expiration:{
                type:"EX",
                value: 7 * 24 * 60 * 60
            }
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
     const {user , jti} = await decodeToken({authorization ,tokenType: tokenEnum.refresh})
     const accessToken = jwt.sign({
        _id: user._id,
        email: user.email
     },process.env.ACCESS_TOKEN_SECRET,{
        expiresIn:"30s",
        jwtid:jti
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


// Resent Confirm Email Otp
export const resentConfirmEmailOtp = async (email)=>{
    const user = await userModel.findOne({email,confirmedAt:{
        $exists: false
    }})
if(!user){
        errorRes({
        msg:"user not found",
        statusCode:404
    })
}

const userId = user._id
const cannotResend = (await redisClient.get(resendOtpKey(userId)) || 
await redisClient.get(attemptsBlockKey(userId)))
if(cannotResend){
    errorRes({
        msg:"estana shwia",
        statusCode:400
    })
}
const attempts = await redisClient.incr(attemptsKey(user._id))
    if(attempts >= 5){
        const blockCount = await redisClient.incr(attemptsBlockCountKey(user._id))
        await redisClient.set(attemptsBlockKey(user._id),0,{
            expiration:{
                type:"EX",
                value:calcBlockSecs(blockCount)
            }
        })
       await redisClient.set(attemptsKey(user._id),0)
    } else{
            await redisClient.set(resendOtpKey(user._id),0,{
        expiration:{
            type:"EX",
            value:60
        }
    })
    }
    const otp = random(6)
    sendEmail({
        to:email,
        subject:"confirm Email",
        html: emailTemplate({otp, subject: "Confirm Email"})
    })
    const redisKey =confirmEmailKey(user._id)
    await redisClient.set(redisKey, await createHash(otp),
{
    expiration:{
        type:"EX",
        value: 60 * 5
    }
})

    return {}
    data:{}
}


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




    const hashedOtp = await redisClient.get(confirmEmailKey(user._id))
    if(!otp){
        errorRes({
            msg:"invalid or expire otp",
            statusCode:404
        })
    }

    const isBlocked = await redisClient.get(attemptsBlockKey(user._id)) 
    if(isBlocked){
        const blockedTTL = await redisClient.ttl(attemptsBlockKey(user._id))
        errorRes({
            msg:`try again after ${Math.round(blockedTTL/ 60)}M`,
            statusCode:400
        })
    }

    const isOtpCorrect = await comparHash(otp, hashedOtp)
    if(!isOtpCorrect){
       const attempts = await redisClient.incr(attemptsKey(user._id))
       if(attempts >= 5){
         const blockCount = await redisClient.incr(attemptsBlockCountKey(user._id))
         await redisClient.set(attemptsBlockKey(user._id),0,{
            expiration:{
                type:"EX",
                value:calcBlockSecs(blockCount)
            }
         })
         await redisClient.set(attemptsKey(user._id),0)
         errorRes({
            msg:`try again after ${Math.round(blockCount/ 60)}M`,
            statusCode:400
         })
       }
    }else{
        user.confirmedAt = new Date() 
        await user.save()
        const userKeys = await redisClient.KEYS(userPrefix(user._id) + "*")
        await redisClient.del(userKeys)
    }





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


// Logout From One Device FN
export const logout = async (userId , jti)=>{
    const user = await userModel.findById(userId)
    if(!user){
        errorRes({
            msg:"user not found",
            statusCode:409
        }) }
    const deleteCount = await redisClient.del(userSessionJwtIdKey(userId, jti))
    if(deleteCount){
        errorRes({
            msg: "already logged out",
            statusCode: 400
        })}
    return {
        data:{} }}

// Logout From All Devices Fn 
export const logoutFromAllDevices = async (userId)=>{
    const user = await userModel.findById(userId)
    if(!user){
        errorRes({
            msg:"user not found",
            statusCode:404
        })
    }
    const deleteCount = await redisClient.del(userSessionJwtIdPrefixKey(userId))
    if(deleteCount){
        errorRes({
            msg: "already logged out",
     }) }
    return {
        data:{}
    }
}