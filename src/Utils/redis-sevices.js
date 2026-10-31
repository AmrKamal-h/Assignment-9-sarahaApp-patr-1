

export const userPrefix = (userId)=> `users:${userId}:otp`


export const confirmEmailKey = (userId)=> `${userPrefix(userId)}:confirmEmail`
export const resendOtpKey = (userId)=> `${userPrefix(userId)}:resend`
export const attemptsKey = (userId)=> `${userPrefix(userId)}:attempts`
export const attemptsBlockKey = (userId)=> `${userPrefix(userId)}:block`
export const attemptsBlockCountKey = (userId)=> `${userPrefix(userId)}:blockCount`




export const userSessionJwtIdPrefixKey = (userId)=>{
    return `users:${userId}:session`
} 



export const userSessionJwtIdKey = (userId, jwtid)=>{
    return ` ${userSessionJwtIdPrefixKey(userId)}:jwtid`
}