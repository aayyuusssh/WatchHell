import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async(req , res) => {
    const { channelId } = req.params 

    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(401 , "invalid channel Id")
    }

    const subscriberId = req.user?._id

    if(channelId === subscriberId.toString()){
        throw new ApiError(400, "You cannot subscribe to your own channel")
    }      

    
    const existingSubscriber = await Subscription.findOne(
        {
            channel : channelId,
            subscriber : subscriberId
        }
    )

    if(!existingSubscriber){
       const newSubscriber =  await Subscription.create(
        {
            channel : channelId ,
            subscriber : subscriberId
        }
       )

       return res.status(201)
       .json(
        new ApiResponse(
            201 , newSubscriber , "new Subscriber added successfully"
        )
       )
    }

    const deletedSubscriber = await Subscription.findOneAndDelete(
        {
            channel : channelId,
            subscriber : subscriberId
        }
    )
    return res 
    .status(200)
    .json(
        new ApiResponse(
            200 , deletedSubscriber , "subscriber removed successfully"
        )
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(401 , "channel id is invalid")
    }

    const subscribersList = await Subscription.find(
        {
            channel : channelId
        }
    ).populate("subscriber", "username fullName avatar.url")

    //   .populate() does ->  It automatically:
    //         Finds referenced document
    //         Replaces ObjectId with real document data

    const subscribersCount = await Subscription.countDocuments({ channel: channelId })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 , 
            {
                subscribersList,
                subscribersCount
            } 
            , `user channel subscribers fetched successfully  `
        )
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!mongoose.Types.ObjectId.isValid(subscriberId)){
        throw new ApiError(400 , "invalid subscriber id")
    }

    const subscribedChannelList = await Subscription.find(
        {
            subscriber : subscriberId
        }
    ).populate("channel" , "username fullName avatar.url").populate("subscriber" , "fullName username")

    const subscribedChannelCount = await Subscription.countDocuments({subscriber : subscriberId})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200 ,
            {
                subscribedChannelList,
                subscribedChannelCount
            } , 
            `subscribed channel fetched `
        )
    )
})


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}