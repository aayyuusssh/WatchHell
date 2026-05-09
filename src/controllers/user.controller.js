import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const registerUser = asyncHandler( async(req , res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists or not - username , email
    // check for images , check for avatar
    // upload them to cloudinary - avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const {fullName , email , username , password} = req.body
    console.log("email : ",email);
    console.log("username : ",username);
    console.log("req.body",req.body)

                // if(fullName === ""){
                //     throw new ApiError(400 , "FullName is required")
                // }
    if (
        [fullName , email , username , password].some((field)=> 
        field?.trim() === "")
    ) {
        throw new ApiError(400 , "All fields are required")        
    }

    const existedUser = await User.findOne({
        $or : [{ email },{ username }]
    })

    if(existedUser){
        throw new ApiError(409 , "User already exists with same email or username")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path ;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path ;

    if(!avatarLocalPath){
        throw new ApiError(400 ,"avatar file is required")
    }



    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    console.log(avatar)

    if(!avatar){
        throw new ApiError(400 ,"avatar file is required")
    }



    const user = await User.create({
        fullName ,
        avatar : {
            url :avatar.secure_url,
            public_id : avatar.public_id
        },
        coverImage : {
            url : coverImage?.secure_url || "",
            public_id :coverImage?.public_id || ""
        },            
        email,
        password,
        username : username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // select method me automatically sab select ho jata ha toh "-" sign laga jo nahi chahiye hota vo likhta ha

    if(!createdUser){
        throw new ApiError(500 , "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200 , createdUser , "user created successfully")
    )

    
})

const generateAccessAndRefreshTokens = async (userId) => {
   try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

   
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave : false })

    

    return {accessToken , refreshToken}

   } catch (error) {
    throw new ApiError(500 , error?.message || "something went wrong for token generation")
    
   }
}

const loginUser = asyncHandler(async (req , res)=> {
    // req.body -> data
    // username or email
    // find user
    //  password check
    // access and refresh token
    //  send cookie

    const {username , email , password} = req.body
    // console.log(email)
    // console.log(username)

    

    // check for user login with either email or username
    if(!username && !email){
        throw new ApiError(400 , "email or username is required")
    }

    // find user 
    const user = await User.findOne({
        $or : [{email} , {username}]
    })

    if(!user){
        throw new ApiError(404 , "user does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if(!isPasswordValid){
    throw new ApiError(401 , "password incorrect")
   }

   const {accessToken , refreshToken} = await generateAccessAndRefreshTokens(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options = {
        httpOnly : true,
        secure : true
   }

   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser , accessToken , refreshToken
            },
            "User logged in succesfully"
        )
   )


})

const logoutUser = asyncHandler(async (req,res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset : {
                refreshToken : 1 // flag mark as true and this remove the field from the document
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("refreshToken" , options)
    .json(
        new ApiResponse(
            200 , {} , "user logged out"
        )
    )


})

const refreshAccessToken = asyncHandler( async (req , res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401 , "unauthorized request")
    }
    try {
    
        const decodedToken = jwt.verify(
            incomingRefreshToken ,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401 , "Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(402 , "refresh token is expired or used")
        }
    
        const {accessToken , refreshToken } = await generateAccessAndRefreshTokens(user._id)
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        return res
        .status(200)
        .cookie("refreshToken" , refreshToken , options)
        .cookie("accessToken" , accessToken , options)
        .json(
            new ApiResponse(
                200,
                {accessToken , refreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401 , error?.message || "Issue occurs while refreshing the access token ")
        
    }

})

const changeCurrentPassword = asyncHandler(async (req , res) => {
    // old password , new password -> req.body
    // user logged in status from req.user (auth middleware)
    // check if old password are same as stored in db 
    // check if new password are not same with old password 
    // change old password with new one in db


    const { oldPassword , newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if( !isPasswordCorrect ) {
        throw new ApiError(401 , "old password is wrong")
    }

    if(oldPassword === newPassword){
        throw new ApiError(400 , "New password is same!! ")
    }

    user.password = newPassword

    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password Chnaged successfully"
        )
    )
})

const getCurrentUser = asyncHandler(async (req,res) => {
    console.log(req)
    return res
    .status(200)
    .json(new ApiResponse(200 , req.user , "current user fetched succesfully"))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const { email , fullName } = req.body

    if(!email || !fullName){
        throw new ApiError(401 , "All field are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                email,
                fullName
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(
        200 , user , "Account details updated successfully"
    ))
})

const updateUserAvatar = asyncHandler(async(req , res) => {

    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(401 , "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(401 , "error while uploading on avatar")
    }

    // delete old file from cloudinary
    const oldAvatarFile = req.user?.avatar?.public_id
    await Promise.allSettled([
        deleteOnCloudinary(oldAvatarFile)
    ])


    const user = await User.findByIdAndUpdate(req.user?._id , 
        {
            $set : {
                avatar : {
                    url : avatar.secure_url,
                    public_id : avatar.public_id
                },
            }
        },
        {
            new : true
        }
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200 , user , "avatar file is updated!! "))

})

const updateUserCoverImage = asyncHandler(async(req, res)=>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(401 , "cover Image is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        throw new ApiError(401 , "cover image error while uploading ")
    }

    // delete old file from cloudinary
    const oldCoverImageFile = req.user?.coverImage?.public_id
    await Promise.allSettled([
        deleteOnCloudinary(oldCoverImageFile)
    ])

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                coverImage : {
                    url : coverImage.secure_url,
                    public_id : coverImage.public_id
                }
            }
        },
        {new : true}
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(
        200 , user , "covere Image update successfully"
    ))

})

const getUserChannelProfile = asyncHandler(async (req , res) => {
    // username -> req.params(url)
    // use aggregation pipeline of subscribers , subscribed TO , is Subscribe or not 

    const { username } = req.params

    if(!username?.trim()){
        throw new ApiError(400 , "username is not available")
    }

    const channel = await User.aggregate([
        {
            $match : {
                username : username?.toLowerCase()
            }
        },
        {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "channel",
                as : "subscribers"
            }
        },
        {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "subscriber",
                as : "subscribedTo"
            }
        },
        {
            $addFields : {
                subscribersCount : {
                    $size : "$subscribers"
                },
                channelSubscribedToCount : {
                    $size : "$subscribedTo"
                },
                isSubscribed : {
                    $cond : {
                        // $in -> array or objects dono ka andar dekh leta ha , yaha object me dekh rha ha
                        if : {$in : [req.user._id , "$subscribers.subscriber"]},
                        then : true,
                        else : false
                    }
                }
            }
        },
        {
            // project -> jo bhi demand kar raha ha usko saari values project nahi karunga infact just selected value hi project karaga 

            $project : {
                username : 1, 
                email : 1 , 
                fullName : 1, 
                subscribersCount : 1,
                channelSubscribedToCount : 1,
                isSubscribed : 1,
                coverImage : 1,
                avatar : 1


            }
        }
    ])

    console.log("channel value : ",channel)

    if(!channel?.length){
        throw new ApiError(404 , "channel does not exist")
    }
    return res.status(200)
    .json(new ApiResponse(
        200 , channel[0] , "user channel fetched successfully"
    ))
})

const getWatchHistory = asyncHandler(async (req, res)=> {

    const user = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHistory",
                // subpipeline for video owner information
                pipeline : [
                    {
                        $lookup : {
                            from : "users",
                            localField : "owner",
                            foreignField : "_id",
                            as : "videoOwner",
                            pipeline : [
                                {
                                    $project : {
                                        username : 1,
                                        fullName : 1,
                                        avatar : 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields : {
                            owner : {
                                // lookup ka baad array milta ha orr usma se first value nikalni padti ha
                                // $first laga kar array remove kr deta ha response me se "[{}]" -> "{}" soo that frontend me easily data bhej saka 
                                $first : "$owner"
                                // $arrayElementsAt : "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(
        200 , user[0].watchHistory , "watch history fetched successfully"
    ))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
    
}
