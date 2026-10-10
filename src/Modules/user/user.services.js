import { userModel } from "../../DB/models/user.model.js"
import { decodeToken, tokenEnum } from "../../Middlewares/auth.middleware.js"
import { comparHash, createHash } from "../../security/hash.js"
import { errorRes } from "../../Utils/error.handel.js"
import jwt from "jsonwebtoken"


export const signupService =async ({fullName,email,password, gender,age,phone , bio,userName})=>{
    const isExist =  await userModel.findOne({
        $or: [
            { email },
            { userName }
        ]
    })  
    
    if(isExist){
        errorRes({
            msg:`${isExist.email == email ? "email": "username"} alredy exist`,
            statusCode:400
        })
    }
    
    const user = await userModel.create({
        fullName,email,password:await createHash(password), gender,age,phone , bio,userName
    })
    return{
        data:{
            user
        }
    }

}



// login service
export const loginService = async (identifier, password)=>{
    const user = await userModel.findOne({
        $or: [
            {email: identifier},
            {userName: identifier},
        ]
    })
    if(!user){
        errorRes({
            msg:"invalid credentials",
            statusCode:400
        })
    }
    const isPasswordMatch = await comparHash(password, user.password)
     if(! isPasswordMatch){ 
            errorRes({
                msg:"invalid credentials",
                statusCode:400
            })
        }
        const accessToken = jwt.sign({
            _id: user._id,
            email: user.email
        },process.env.ACCESS_TOKEN_SECRET,{
            expiresIn:"30Min"
        })

      
        const refreshToken = jwt.sign({
            _id: user._id,
            email: user.email
        },
    process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:"7d"
    })
      return {
            data:{
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

