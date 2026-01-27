// require('dotenv').config({path : "./env"})
import dotenv from "dotenv"

dotenv.config({
    path:"./env"
})


import mongoose from "mongoose";
import {DB_NAME} from "./constants.js"
import ConnectDB from "./db/index.js";
import { app } from "./app.js";

ConnectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`server is running on port : ${process.env.PORT}`);        
    })
    app.on("error",(error)=>{
        console.log("error : ",error)
        throw error
    })
})
.catch((error)=>{
    console.log("Mongo DB connection failed");
    
})







/*

// This is A approch to connect with DB
// Another approach is ki hum different folder me seprate code likha DB connection ka or fir usko yaha import karka execute kara

import express from "express"
const app = express()

// iffie - ;(function define)(simultaneusly function call) --> ()()
// orr instead hum normal way me funtion bana kar alag se function call kr skta ha
;(async ()=> {
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

       app.on("error",(error)=>{
            console.log("error : ",error)
            throw error
       })

       app.listen(process.env.PORT , ()=>{
            console.log(`App is listen on Port : ${process.env.PORT}`)
       })
        
    } catch (error) {
        console.error("error : ",error)
        throw error
        
    }

})()






*/