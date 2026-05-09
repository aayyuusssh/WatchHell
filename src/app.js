import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

const allowedOrigins = (process.env.CORS_ORIGIN || "https://watch-hell.vercel.app").split(",").map((origin) => origin.trim()).filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin)) return callback(null, true)
        callback(new Error("CORS policy does not allow access from this origin."))
    },
    credentials: true
}))



app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended : true , limit : "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())



// import routes
import userRouter from "./routes/user.routes.js"  // router method named as userRouter while being imported

// routes declaration
app.use("/api/v1/users",userRouter)
// http://localhost:8000/api/v1/users/register


import videoRouter from "./routes/video.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import likeRouter from "./routes/like.routes.js"
import commentRouter from "./routes/comment.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import healthcheckRouter from "./routes/healthcheck.routes.js"


app.use("/api/v1/video",videoRouter)
app.use("/api/v1/subscription" , subscriptionRouter)
app.use("/api/v1/playlist" , playlistRouter)
app.use("/api/v1/tweet" , tweetRouter)
app.use("/api/v1/like" , likeRouter)
app.use("/api/v1/comment" , commentRouter)
app.use("/api/v1/dashboard" , dashboardRouter)
app.use("/api/v1/healthcheck" , healthcheckRouter)

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || err.status || 500
    const message = err.message || "Something went wrong. Please try again."

    return res.status(statusCode).json({
        statusCode,
        data: null,
        message,
        success: false
    })
})












export { app }
