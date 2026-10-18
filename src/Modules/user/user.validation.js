import { z } from "zod" 
import { GenderEnum } from "./user.types.js"

export const signupSchema = {
    body: z.strictObject({
        fullName: z.string(),
        email: z.email(),
        phone: z.string().min(10).max(15),
        password: z.string(),
        age: z.number(),
        gender: z.enum(GenderEnum),
        userName: z.string(),
        bio: z.string().optional(),
        confirmPassword: z.string()
    }).refine((arg) => arg.password === arg.confirmPassword, {
        error: "password mismatch",
        path: ["confirmPassword", "password"] })
}


export const resetPasswordSchema = {
    body: z.strictObject({
        email:z.email(),
        password:z.string(),
        confirmPassword:z.string(),
        otp:z.string
    }).refine((arg) => arg.password == arg.confirmPassword,{
        error: "password mismatch",
        path:["password, confirmPassword"]
    }
)
    
}