import mongoose from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async(req , res) => {
    const { content } = req.body

    if(!content){
        throw new ApiError(400 , "content is required")
    }

    const tweet = await Tweet.create(
        {
            content,
            owner : req.user?._id
        }
    )

    return res
    .status(201)
    .json(
        new ApiResponse(
            201 , tweet , "tweet created successfully!!"
        )
    )

})

const getUserTweets = asyncHandler(async(req , res) => {
    const {userId} = req.params
    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400 , "user id is not correct")
    }

    const user = await User.findById(userId)

    if(!user){
        throw new ApiError(404 , "user not found")
    }

    const userTweets = await Tweet.find(
        {
            owner : userId
        }
    )

    const countUserTweets = userTweets.length

    if(userTweets.length == 0){
        throw new ApiError(404 , "no tweets found")
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(
            200 , 
            {
                userTweets,
                countUserTweets
            },
            "user tweets fetched successfully"
        )
    )
})

const updateTweet = asyncHandler(async(req , res) => {
    const { content } = req.body
    const {tweetId} = req.params

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400 , "tweet id is wrong")
    }
    if(!content){
        throw new ApiError(400 , "tweet content is required")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404 , "tweet not found")
    }

    if(tweet.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403 , "only onwer can update the tweet")
    }

    tweet.content = content
    const updatedTweet = await tweet.save()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 , updatedTweet , "tweet updated successfully"
        )
    )
})

const deleteTweet = asyncHandler(async(req, res) => {
    const {tweetId} = req.params
    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400 , "invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404 , "tweet not found")
    }

    if(tweet.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403 , "only onwer can delete the tweet")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 , deletedTweet , "tweet deleted successfully"
        )
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}