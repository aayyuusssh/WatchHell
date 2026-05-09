import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/user.models.js"
import {Like} from "../models/like.models.js"
import {Subscription} from "../models/subscription.models.js"
import {Comment} from "../models/comment.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteOnCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query

    let pageNum = parseInt(page)
    let limitNum = parseInt(limit)

    if (pageNum < 1) pageNum = 1
    if (limitNum < 1) limitNum = 1
    if (limitNum > 25) limitNum = 25

    const skip = (pageNum - 1) * limitNum

    const filter = {}

    if (userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new ApiError(400, "Invalid userId")
        }
        filter.owner = userId
    }

    if (query && query.trim()) {
        filter.title = {
            $regex: query.trim(),
            $options: "i"
        }
    }

    const sortOrder = sortType === "asc" ? 1 : -1

    const [videos, videoCount] = await Promise.all([
        Video.find(filter)
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limitNum)
            ,

        Video.countDocuments(filter)
    ])

    if (videos.length === 0) {
        throw new ApiError(404, "No videos found")
    }

    const totalPageCount = Math.ceil(videoCount / limitNum)

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos,
                videoCount,
                totalPageCount,
                currentPage: pageNum
            },
            "All videos fetched successfully"
        )
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video


    if(!title || !description){
        throw new ApiError(400 , "Title and description are mandatory")
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if(!videoFileLocalPath){
        throw new ApiError(400 , "video file is required")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400 , "thumbnail is required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!videoFile || !thumbnail){
        throw new ApiError(400 , "videoFile or thumbnail upload failed")
    }

    const video = await Video.create({
        title,
        description,
        videoFile : {
            url : videoFile?.secure_url ,
            public_id : videoFile?.public_id
        },
        thumbnail : {
            url : thumbnail?.secure_url,
            public_id : thumbnail?.public_id
        },
        duration : videoFile?.duration,
        owner : req.user?._id,
    })

    return res
    .status(200)
    .json(new ApiResponse(
        200 , video , "video published successfully"
    )) 
})

const getVideoByID = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)
        .populate("owner", "username fullName avatar")

    if(!video){
        throw new ApiError(404 , "video not found")
    }

    video.views = video.views + 1
    await video.save()

    const ownerId = video.owner?._id
    const userId = req.user?._id

    const [likesCount, isLiked, subscribersCount, isSubscribed] = await Promise.all([
        Like.countDocuments({ video: video._id }),
        Like.exists({ video: video._id, likedBy: userId }),
        ownerId ? Subscription.countDocuments({ channel: ownerId }) : 0,
        ownerId && ownerId.toString() !== userId.toString()
            ? Subscription.exists({ channel: ownerId, subscriber: userId })
            : false
    ])

    const videoDetails = {
        ...video.toObject(),
        likesCount,
        isLiked: Boolean(isLiked),
        subscribersCount,
        isSubscribed: Boolean(isSubscribed)
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 , videoDetails , "video fetched successfully"
        )
    )
})

const updateVideoDetails = asyncHandler(async ( req , res) => {
    const { videoId } = req.params
    const { title , description } = req.body

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }


    if(!title || !description){
        throw new ApiError(401 , "title and decription change details are missing")
    }

    const thumbnailLocalPath = req.file?.path
    if(!thumbnailLocalPath){
        throw new ApiError(401 , "thumbnail is missing")
    }
    
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnail){
        throw new ApiError(401 , "thumbnail is not uploading")
    }

    const video = await Video.findByIdAndUpdate(
        videoId , 
        {
            $set : {
                title ,
                description,
                thumbnail : {
                    url : thumbnail?.secure_url,
                    public_id : thumbnail?.public_id
                }    
            }
        },
        {
            new : true
        }
    )

    return res 
    .status(200)
    .json(
        new ApiResponse(
            200 , video , "details update successfully"
        )
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    const video =  await Video.findById(videoId)
    if(!video){
        throw new ApiError(401 , " video is not present")
    }

    if(video.owner?.toString() !== req.user?._id.toString()){
        throw new ApiError(403 , "only owner can delete the video")
    }

    await Promise.allSettled([
        deleteOnCloudinary(video?.videoFile?.public_id , "video"),
        deleteOnCloudinary(video?.thumbnail?.public_id , "image")
    ])

    const deletedVideo = await Video.findByIdAndDelete(videoId)
    await Promise.all([
        Comment.deleteMany({ video: videoId }),
        Like.deleteMany({ video: videoId })
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 , deletedVideo , "video deleted successfully"
        )
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!mongoose.Types.ObjectId.isValid( videoId )){
        throw new ApiError(400 , "wrong video Id ")
    }

    
    const video = await Video.findById(videoId)
    
    if(!video){
        throw new ApiError(404 , "video  is not present")
    }

    video.isPublished = !video.isPublished

    await video.save()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 , video , "toggle publish status successfully!!"
        )
    )
})

export { 
    getAllVideos,
    publishAVideo,
    getVideoByID,
    updateVideoDetails,
    deleteVideo,
    togglePublishStatus
}
