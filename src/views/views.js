const express = require("express")
const router = express.Router()
const userController = require("../controllers/controller")
const jwt= require("jsonwebtoken")
const secretKey = process.env.secretkey

const verifytoken= (req, res, next)=>{
    const token = req.body.token || req.query.token || req.headers['x-access-token']
    if(!token){
        res.status(403).send("Token required")
    }
    try{
        const decode= jwt.verify(token, secretKey)
        req.user = decode
        console.log(req.user)
    }catch(err){
        return res.status(401).send("Invalid token")
    }
    return next()
}

router.get('/', userController.home)
router.post("/", userController.createUser)
router.put("/update/:id", userController.updateUser)
router.post("/login", userController.login)
router.post('/items/:id', verifytoken,userController.items)
router.get("/getAllItemByID", verifytoken, userController.getAllItemsById)
router.get("/getAllItems", userController.getAllItems)
router.post("/cart/:id", verifytoken, userController.cart)
router.delete("/deleteItem/:id", verifytoken,  userController.deleteItem)


module.exports = router