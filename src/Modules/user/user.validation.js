import z, { string } from "zod"
import { GenderEnum } from "./user.types.js"

export const signupSchema ={
    body: z.strictObject({
    fullName: z.string(),
    email: z.email(),
    phone: z.string().min(10).max(15),
    password: z.string(),
    age: z.number(),
    gender: z.enum(GenderEnum),
    userName: z.string(),
    bio: z.string().optional()
})
}