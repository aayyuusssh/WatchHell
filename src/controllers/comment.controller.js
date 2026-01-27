import mongoose , {isValidObjectId} from "mongoose";
import { Comment } from "../models/comment.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.models.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(videoId)){
        throw new ApiError(400 , "invalid video id")
    }

    const existVideo = await Video.findById(viedoId)
    if(!existVideo){
        throw new ApiError(404 , "video not found")
    }

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)

    if(pageNum < 1) pageNum = 1
    if(limitNum < 1) limitNum = 1
    if(limitNum > 25) limitNum = 25

    const skip = (pageNum - 1) * limitNum

    const [ comments , totalCommentCount] = await Promise.all([
        Comment.find({
            video : videoId
        })
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip(skip)
        ,
        Comment.countDocuments({
            video : videoId
        })
    ])

    if(comments.length===0){
        throw new ApiError(404 , "no comments found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 ,
            {
                comments,
                totalCommentCount
            },
            "all comments fetched successfully"            
        )
    )
})

const addComment = asyncHandler(async(req , res) => {
    const { content } = req.body
    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400 , "invalid video id")
    }
    const isVideoExist = await Video.findById(videoId)

    if(!isVideoExist){
        throw new ApiError(404 , "video is missing")
    }

    if(!content || !content.trim()){
        throw new ApiError(400 , "comment is required")
    }

    const comment = await Comment.create(
        {
            content ,
            video : videoId , 
            owner : req.user?._id
        }
    )

    return res
    .status(201)
    .json(
        new ApiResponse(
            201 , comment , "comment added successfully"
        )
    )
})

const updateComment = asyncHandler(async (req , res) => {
    const { content } = req.body
    const {commentId} = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(400 , "invalid comment id")
    }  

    if(!content || !content.trim()){
        throw new ApiError(400 , "comment is required")
    }

    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404  ,"comment is missing")
    }

    if(comment.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(400 , "only owner can update the comment")
    }

    comment.content = content
    const updatedComment = await comment.save()

    if(!updatedComment){
        throw new ApiError(403 , "comment is not updated")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200 , updatedComment , "comment updated successfully"
        )
    )
})

const deleteComment = asyncHandler(async (req , res) => {
    const { commentId } = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(400 , "comment id is invalid")
    }

    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(404 , "comment not found")
    }

    if(comment.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403 , "only owner can delete the comment")
    }

    await comment.deleteOne()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 , {} ,"comment deleted successfully"
        )
    )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}