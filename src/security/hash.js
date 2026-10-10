import  {hash, compare } from "bcrypt"


export const createHash =async (password)=>{
    const generatedHash =await hash(password, 10)
    return generatedHash
}


export const comparHash = async (password , hashedPassword)=>{
    const isMatch = await compare(password, hashedPassword)
    return isMatch
}