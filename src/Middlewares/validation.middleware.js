import { signupSchema } from "../Modules/user/user.validation.js"
import { errorRes } from "../Utils/error.handel.js"



export const validation = (schema)=>{
    return (req,res,next)=>{
        // const validationRes = schema.safeParse(req.body)
        const validationErrors = []
        Object.keys(schema).map(ele=>{
           const validationRes =  schema[ele].safeParse(req[ele])
                     if(! validationRes.success){
                        validationErrors.push(validationRes.error.issues)
                }
        })
        if(validationErrors.length){
            errorRes({
                msg:"validation Error",
                statusCode: 400,
                options: validationErrors
            })
        }   
        next()
    }
}