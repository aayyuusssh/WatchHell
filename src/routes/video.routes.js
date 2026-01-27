import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteVideo, getAllVideos, getVideoByID, publishAVideo, togglePublishStatus, updateVideoDetails } from "../controllers/video.controller.js";

const router = Router()
router.use(verifyJWT) // Apply verifyJWT middleware to all routes in this file

router.route("/")
.get(getAllVideos)
.post(
    upload.fields([
        {
            name : "videoFile",
            maxCount: 1
        },
        {
            name : "thumbnail",
            maxCount : 1
        }
    ]) ,
    publishAVideo
)

router.route("/:videoId")
        .get(getVideoByID)
        .patch( upload.single("thumbnail"), updateVideoDetails)
        .delete(deleteVideo)

router.route("/toggle/video/:videoId").patch(togglePublishStatus)        

export default router