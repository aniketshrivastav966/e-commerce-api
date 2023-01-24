const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const app = express()
require("dotenv").config()
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
const port = process.env.port
const mongoDb =process.env.mongoDb || 3000
mongoose.set('strictQuery', true);

mongoose.connect(mongoDb, {useNewUrlParser:true}).then(()=>{
    console.log("database connected")
}).catch((err)=>{
    console.log("connection error", err)
    process.exit()
})

app.get("/", (req, res)=>{
    res.status(200).json({message:"Welcome to e-commeerce api", status:true})
})
const userRoutes= require("./src/views/views")
app.use("/api", userRoutes)
app.listen(process.env.PORT)







