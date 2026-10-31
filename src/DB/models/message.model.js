import { Types } from "mongoose"
import { model, Schema } from "mongoose"





const messageSchema = new Schema({
    content:{
        type:String,
        required:function(){
            this.images?.length? false :true
        }
    },
    images:{
        type:[String]
    },
    to:{
        type: Types.ObjectId,
        required: true,
        ref:"User"
    }
},{
        timestamps: true,
    strict: true,
    strictQuery: true, // query security
    optimisticConcurrency:true, // Version Updater
    toJSON:{
        virtuals:true,
        getters:true,
        transform(doc,ret){
            delete ret.id 
            return ret
        }
    },
    toObject:{
        virtuals:true,
        getters:true,
        transform(doc,ret){
            delete ret.id
            return ret
        }
    }
})



export const messageModel = model("Message",messageSchema)