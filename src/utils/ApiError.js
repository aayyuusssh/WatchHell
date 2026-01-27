class ApiError extends Error{
    constructor(
        statusCode,
        message = "something went wrong",
        errors = [],
        stack = ""
    ){
        super(message) // super parent class(error class) ka contructor ko call karna ka liya use hota ha !! iska baad hi "" this " keyword ka use karka reference le skta ha orr overwrite kar sakta ha !!  

        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if(stack){
            this.stack = stack
        }
        else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {ApiError}