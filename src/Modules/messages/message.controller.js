import { Router } from "express";
import { uploadFile } from "../../Utils/multer.js";
import { sendMessage } from "./message.services.js";
import { successRes } from "../../Utils/success.res.js";



const router = Router()
export const routes = {
    base:"/messages",    //GET
    send:"/send",       //POST
}

router.post(routes.send, uploadFile("message").array("images", 5 ),async (req,res)=>{
     const {content, to} = req.body
     const images = req.files.map(ele=> ele.path)
     const {data} =  await sendMessage(content , images, to)

     successRes({
        res,
        data 
     })
})














export default router 