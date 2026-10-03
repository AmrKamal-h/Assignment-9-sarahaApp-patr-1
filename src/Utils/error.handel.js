

export const errorRes = ({msg = "Error Message", statusCode = 500 }) =>{
    throw new Error(msg,{
        cause: {
            statusCode
        }
    })
}