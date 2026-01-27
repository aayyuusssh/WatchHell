import mongoose from "mongoose"
import {Video} from "../models/video.models.js"
import {Subscription} from "../models/subscription.models.js"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const channelId = req.user?._id

    const [totalSubscribers , totalChannelsSubscribedTo , totalVideos ] = await Promise.all([
        Subscription.countDocuments({
            channel : channelId
        }),

        Subscription.countDocuments({
            subscriber : channelId
        }),

        Video.countDocuments({
            owner : channelId
        }),
    ])

    const videosTotalViewsArray = await Video.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group : {
                _id : null,
                totalViews : {
                    $sum : "$views"
                }
            }
        }
    ])

    const totalVideoViews = videosTotalViewsArray[0]?.totalViews || 0


    const totalVideoLikes = await Video.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(channelId)
            }    
        },
        {
            $lookup : {
                from : "likes",
                localField : "_id",
                foreignField : "video",
                as : "likeDocument"
            },
        },
        {
            $unwind : {
                path: "$likeDocument",
                preserveNullAndEmptyArrays: true
            }
            
        },
        {
            $group :{
                _id : null,
                totalLikes : {
                    $sum : 1
                }
            }
        }
    ])


    const totalLikesCount = totalVideoLikes[0]?.totalLikes || 0

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 ,
            {
                totalSubscribers,
                totalChannelsSubscribedTo,
                totalVideos,
                totalVideoViews,
                totalLikesCount
            },
            "all stats successfully fetched"
        )
    )

    

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const {page = 1} = req.query 

    const channelId = req.user?._id
    if(!channelId){
        throw new ApiError(400 , "channel id not found")
    }

    const pageNum = parseInt(page)

    if(pageNum < 1) pageNum = 1

    const limit = 10
    const skip = (pageNum - 1) * limit

    const [videos, totalVideoCount ] = await Promise.all([
        Video.find(
            {
                owner : channelId
            }
        )
        .sort({"createdAt" : -1})
        .limit(limit)
        .skip(skip)
        ,
        Video.countDocuments({
            owner : channelId
        })
    ])    

    

    if(videos.length === 0){
        throw new ApiError(404 , "No video created by this channel")
    }

    const pages = Math.ceil(totalVideoCount / limit)


    return res
    .status(200)
    .json(
        new ApiResponse(
            200 ,{ videos , pages } , "all videos got fetched"
        )
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }