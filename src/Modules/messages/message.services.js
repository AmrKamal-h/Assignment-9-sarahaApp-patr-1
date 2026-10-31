import { messageModel } from "../../DB/models/message.model.js"
import { userModel } from "../../DB/models/user.model.js"
import { errorRes } from "../../Utils/error.handel.js"






export const sendMessage =async(content , images , to)=>{
   const user = await userModel.findById(to)
    if(!user){
        errorRes({
            msg:"User Not Found",
            statusCode:404
        })
    }

    const message = await messageModel.create({
        content,
        images,
        to
    })

    return {
        data:{
            message
        }
    }
}