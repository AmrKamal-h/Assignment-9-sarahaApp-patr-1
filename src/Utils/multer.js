import multer, { diskStorage } from "multer"
import fs from "fs/promises"




export const uploadFile = (dest = "/general")=>{
    const storage = diskStorage({
        destination: async (req,file,cb)=>{
            const userId = req.user._id
            const folderName = `./uploads/${dest}/${userId}`
            console.log(0);
            
            try {
                await fs.access(folderName)
            } catch (error) {
                await fs.mkdir(folderName,{
                    recursive:true
                })
            }
            cb(null, folderName)
        },
        filename:(req, file , cb)=>{
            const userName = req.user.userName
            const fileName = userName + " _ "+ Date.now() +" _ "+ file.originalname
            cb(null,fileName)
        }
    })

    return multer({
        storage
    })
}