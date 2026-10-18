

export const errorRes = ({msg = "Error Message", statusCode = 500 , options }) =>{
    throw new Error(msg,{
        cause: {
            statusCode,
            options
        }
    })
} 