import { model, Schema } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../Modules/user/user.types.js";
import { decryption, encryption } from "../../security/encrption.js";

const otpSchema = new Schema({
    code:{
        type:String,
        required:true,

    },
    expireIn:{
        type:Date,
        default: Date.now()  + 5 * 60 * 1000
    }
})
otpSchema.index("expireIn",{
    expireAfterSeconds:0
})

const userSchema = new Schema ({
    firstName:{
        type: String,
        required: true
    },
    lastName:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique:true       
    },
    password:{
        type: String,
        required: true,        
    },
    phone:{
        type: String,
        set(value){
            return encryption(value) 
        },
        get(value){
            return decryption(value)
        }
    },
    age:Number,
    profileImage:{
        type: String
    },
    gender:{
        type: Number,
        enum:Object.values(GenderEnum)
    },
    provider:{
        type: Number,
        enum:Object.values(ProviderEnum),
        default: ProviderEnum.system
    },
    userName:{
        type: String,
        required:true,
        unique:true
    },
    role:{
        type:Number,
        enum:Object.values(RoleEnum),
        default: RoleEnum.user
    },
    bio:String,
    confirmedAt:{
        type: Date
    },
    blockedAt: Date,
    //  otp: otpSchema
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
            delete ret.password
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
    },
    virtuals: {
        fullName: {
            get(){
                return this.firstName + " " + this.lastName
            },
            set(value){
                const [firstName,lastName] = value.split(" ")
                if (!firstName || !lastName) {
                    throw new Error("Invalid Full name")
                }
                this.set("firstName",firstName)
                this.set("lastName", lastName)
            }
        }
    }
}) 


export const userModel = model("User",userSchema)