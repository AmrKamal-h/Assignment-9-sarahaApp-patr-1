import chalk from "chalk";
import { createClient } from "redis";



export const redisClient = createClient({
    url:process.env.REDIS_URL,
    database:1,
    RESP: 2
})




redisClient.on("error",(err)=>console.log("REDIS Client Error", err))
.on("connect", ()=> console.log(chalk.bgBlueBright("REDIS Connected successfully")))
.connect()