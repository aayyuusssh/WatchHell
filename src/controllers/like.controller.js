import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.models.js"
import {Comment} from "../models/comment.models.js"
import {Tweet} from "../models/tweet.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async(req , res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400 , "invalid video id")
    }

    const existingLike = await Like.findOne(
        {
            video : videoId,
            likedBy : req.user?._id
        }
    )

    if(!existingLike){
        const likeVideo = await Like.create(
            {
                video:videoId,
                likedBy : req.user?._id
            }
        )
        
        return res
        .status(200)
        .json(
            new ApiResponse(
                200 , likeVideo , "Video liked successfully"
            )
        )
    }

    const removedLike = await Like.findOneAndDelete(existingLike._id)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 , removedLike , "video liked removed successfully"
        )
    )
})

const toggleCommentLike = asyncHandler(async(req, res) => {
    const { commentId } = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(400 , "invalid comment id")
    }

    const comments = await Comment.findById(commentId)
    if(!comments){
        throw new ApiError(404 , "Comment not found")
    }

    const existingLike = await Like.findOne(
        {
            comment : commentId,
            likedBy : req.user?._id
        }
    )


    if(!existingLike){
        const likedComment = await Like.create(
            {
                comment : commentId,
                likedBy : req.user?._id
            }
        )

        return res
        .status(200)
        .json(
            new ApiResponse(
                200 , likedComment , "Liked the comment"
            )
        )
    }

    const removedLike = await Like.findByIdAndDelete(existingLike._id)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 , removedLike , "removed the like from comment"
        )
        
    )
})

const toggleTweetLike = asyncHandler(async(req, res) => {
    const { tweetId } = req.params
    console.log(tweetId);
    

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400 , "invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404 , "tweet not found")
    }

    const existingLike = await Like.findOne(
        {
            tweet : tweetId,
            likedBy : req.user?._id
        }
    )


    if(!existingLike){
        const likedTweet = await Like.create(
            {
                tweet : tweetId,
                likedBy : req.user?._id
            }
        )

        return res
        .status(200)
        .json(
            new ApiResponse(
                200 , likedTweet, "Liked the tweet"
            )
        )
    }

    await Like.findByIdAndDelete(existingLike._id)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 , {} , "removed the like from tweet"
        )      
    )
})

// const getLikedVideos = asyncHandler(async(req , res) => {
    
//     const likedVideos = await Like.find({
//         likedBy: req.user._id,
//         video: { $ne: null }   // ensures only video likes  (ne - not equal)
//     }).populate("video" , "title description videoFile.url thumbnail.url duration")

//     if(likedVideos.length == 0){
//         throw new ApiError(400 , "NO liked Videos")
//     }

//     return res
//     .status(200)
//     .json(new ApiResponse(200 , likedVideos  , "all liked videos"))
// })

const getLikedVideos = asyncHandler(async(req , res) => {

    const likedVideos = await Like.aggregate([
        {
            $match : {
                likedBy : new mongoose.Types.ObjectId(req.user?._id),
                video : {$ne : null,},
            },
        },
        {
            $lookup : {
                from : "videos",
                localField : "video",
                foreignField : "_id",
                as : "videoDocument"
            }
        },
        {
            $unwind : "$videoDocument"
        },
        {
            $project : {
                video : {
                    _id : "$videoDocument._id",
                    thumbnail : "$videoDocument.thumbnail.url",
                    videoFile : "$videoDocument.videoFile.url",
                    title : "$videoDocument.title",
                    description : "$videoDocument.description",
                }
            }
        }
    ])

    return res.status(200)
    .json(
        new ApiResponse(
            200 , likedVideos , "all liked  videos fetched"
        )
    )
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}