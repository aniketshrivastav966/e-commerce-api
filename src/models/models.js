const mongoose = require("mongoose")
const validator = require("validator")
// User Model
const UserSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        lowercase:true
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Email is invalid")
            }
        }
    },
    password:String,
    isAdmin:Boolean
})
const User= mongoose.model("User", UserSchema)

// Item Model
const ObjectID =mongoose.Schema.Types.ObjectId

const ItemSchema = mongoose.Schema({
    owner:{
        type:ObjectID,
        required:true, 
        ref:"User"
    },
    name:String,
    description:String,
    category:String,
    price:Number
})
const Item = mongoose.model("Item", ItemSchema)

const CartSchema = mongoose.Schema({
    owner:{
        type:ObjectID,
        required:true,
        ref:"User"
    },
    items:[{
        itemID:{
            type:ObjectID,
            ref:"Item",
            required:true
        },
        name:String,
        quantity:{
            type:Number,
            default:1,
            required:true
        },
        price:Number
    }], 
    bill:{
        type:Number,
        required:true,
        default:0   
    }
})
const Cart = mongoose.model("Cart", CartSchema)

const ProductSchema=mongoose.Schema({
    admin:{
        type:ObjectID,
        required:true,
        ref:"User"
    },
    productName :{
        type:String,
        required:true
    },
    category :{
        type:String,
        required:true
    },
    image :{
        type:String,
        required:true
    },
    productDescription :{
        type:String,
        required:true
    },
    productProperties :{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    }
    
})
Product=mongoose.model("Product", ProductSchema)
module.exports = {User, Item, Cart};
