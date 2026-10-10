import { signupSchema } from "../Modules/user/user.validation"
import { errorRes } from "../Utils/error.handel"



export const validation = (schema)=>{
    return (req,res,next)=>{
        // const validationRes = schema.safeParse(req.body)
        const validationErrors = []
        object.keys(schema).map(ele=>{
           const validationRes =  schema[ele].safeParse(req[ele])
                     if(! validationRes.success){
                        validationErrors.push(validationRes.errors.issues)
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