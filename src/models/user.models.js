import mongoose from "mongoose";
import  jwt from "jsonwebtoken";
import bcrypt from "bcrypt" ;

const userSchema = new mongoose.Schema(
{
    username : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true // searching field ka liya         
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,     
    },
    fullName : {
        type : String,
        required : true,
        trim : true,   
        index : true  
    },
    avatar : {
        url : {
            type : String, // cloudinary url 
            required : true,
        },            
        public_id : {
            type : String,
            required : true,
        }           
    },
    coverImage : {
        url : {
            type : String, // cloudinary url 
            required : true,
        },            
        public_id : {
            type : String,
            required : true,
        }  
    },
    watchHistory : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Video"
        }    
    ],
    password : {
        type : String,
        required : [true, "Password is required"]

    },
    refreshToken : {
        type : String
    }
}
,{timestamps:true})

userSchema.pre("save" , async function (){
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password , 10) ;
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password , this.password) // compare return either true or false
} // user defined method to check password is correct or wrong

userSchema.methods.generateAccessToken = function(){
    const accessToken = jwt.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username,
            fullName : this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
    return accessToken
    // console.log("accessToken at model ", accessToken)
    
}

userSchema.methods.generateRefreshToken = function(){
    const refreshToken = jwt.sign(
        {
            _id : this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
    return refreshToken
    // console.log("refreshToken at model ", refreshToken)
}

export const User = mongoose.model("User" , userSchema)
