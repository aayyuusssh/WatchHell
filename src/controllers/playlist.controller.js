import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.models.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description , videos} = req.body

    if(!name || !description){
        throw new ApiError(400 , "Name or description is required")
    }

    if(!videos || !Array.isArray(videos)){
        throw new ApiError(401 , " videos array is required")
    }

    videos.forEach(id => {
        if(!mongoose.Types.ObjectId.isValid(id)){
            throw new ApiError(400 , `Invalid Id ${id} `)
        }    
    });

    const playlist = await Playlist.create(
        {
            name ,
            description,
            owner : req.user?._id,
            videos 
        }
    )

    return res
    .status(201)
    .json(
        new ApiResponse(
            201 , playlist , "new playlist created successfully"
        )
    )
})

const getUserPlaylists = asyncHandler( async ( req , res) => {
    const { userId } = req.params

    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400 , "invalid user id")
    } // it just check the mongodb id format , not necessarily check for id data present

    const playlists = await Playlist.find(
        {
            owner : userId
        }
    )

    const playlistCount = playlists.length

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 , 
            {
                playlists,
                playlistCount
            },
            "user playlists fetched successfully"
        )
    )
    
})

const getPlaylistById = asyncHandler( async(req , res) => {
    const {playlistId} = req.params

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError( 400 , "invalid playlist Id")
    }

    const playlist = await Playlist.findById(playlistId)
                            .populate("videos" , "title thumbnail.url videoFile.url duration description") 
                            .populate("owner" , "username fullName")

    if(!playlist){
        throw new ApiError(404 , "Playlist does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 , playlist , "playlist fetched successfully !!"
        )
    )
})

const addVideoToPlaylist = asyncHandler(async(req, res) => {
    const { videoId , playlistId } = req.params

    if(!mongoose.Types.ObjectId.isValid(videoId) || !mongoose.Types.ObjectId.isValid(playlistId) ) {
        throw new ApiError(400 , "video id or playlist id is invalid")
    }

    const existingVideo = await Video.findById(videoId)
    if(!existingVideo){
        throw new ApiError(401 , "video not found")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet : {
                videos : videoId
            }
        },
        {
            new : true
        }
    )

    if(!updatedPlaylist){
        throw new ApiError(404, "Playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 , updatedPlaylist , "video added to playlist !! "
        )
    )
})

const removeVideoFromPlaylist = asyncHandler(async(req , res) => {
    const {videoId , playlistId} = req.params

    if(!mongoose.Types.ObjectId.isValid(videoId) || !mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(401 , "Id format error")
    }

    const playlist = await Playlist.findById(playlistId)
    console.log(playlist);
    

    playlist.videos =  playlist.videos.filter(id => id.toString() !== videoId)
    //  video is stored in the form of object inside videos array  

    await playlist.save()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 , playlist , "successfully removed video from playlist "
        )
    )
})

const deletePlaylist = asyncHandler(async (req , res) => {
    const {playlistId} = req.params

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(401 , "invalid id format")
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId)
    if(!playlist){
        throw new ApiError(404 , "Playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 , playlist , "playlist deleted successfully"
        )
    )
})

const updatePlaylist = asyncHandler(async (req , res) => {
    const { playlistId } = req.params
    const { name , description } = req.body
    
    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(404 , "wrong playlist format")
    }

    if(!name || !description){
        throw new ApiError( 400 , "name and description are required")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId , 
        {
            $set : {
                name , 
                description
            }
        },
        {
            new : true
        }
    )
    if(!playlist){
        throw new ApiError(400 , "playlist not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(
            200 , playlist , "playlist details updated successfully"
        )
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}