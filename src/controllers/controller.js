const userModel = require("../models/models")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const UserSchema = userModel.User
const ItemSchema = userModel.Item
const CartSchema = userModel.Cart

const secretKey = process.env.secretkey



exports.home=async (req , res)=>
{
    const setOptions=["name", "email", "username", "isAdmin"]
    UserSchema.find({}, setOptions).then((user)=>{
        res.status(200).send({data:user, status:true})
    }).catch((err)=>{
        res.status(404).send({message:err.message || "something went wrong", status:false})
    })             
}

exports.createUser = (req, res)=>
{
    const user = new UserSchema
    ({
        name:req.body.name, 
        username:req.body.username,
        email:req.body.email,
        password:bcrypt.hashSync(req.body.password, 8),
        isAdmin:req.body.isAdmin || false
    })
    user.save().then(data=>
        {
            res.status(201).send(data)
        }).catch(err=>{
        res.status(501).send({message:err.message || "something went wrong"})
    })

}

exports.updateUser = (req, res)=>{
    UserSchema.findByIdAndUpdate(req.params.id, {name:req.body.name,isAdmin:req.body.isAdmin || false}, {new:true}).then(data=>{
        res.status(201).json(data)
    }).catch(err=>{
        res.status(404).json({message:"Something went wrong" + req.params.id, status:false})
    })
}

exports.login = (req, res)=>
{
    UserSchema.findOne({email:req.body.email}).then(user=>{
        const passwordIsValid =bcrypt.compareSync(req.body.password, user.password)
        if (passwordIsValid){
            const token = jwt.sign({user_id:user.id, email:user.email}, secretKey, {expiresIn:"2h"})
            res.status(200).send({user:user.name,token:token, status:true})
        }
        else{
            res.status(401).send({message:"Invalid Credintials", status:false})
        }
    }).catch(err=>{
        res.status(404).send({message:err.message || "Something went wrong", status:false})
    })
}

exports.items = (req, res)=>{
    try
    {
        UserSchema.findById(req.params.id, (err, user)=>{
            if(user)
            {
                const item = new ItemSchema({
                    owner:user.id,
                    name:req.body.name,
                    description:req.body.description,
                    category:req.body.category,
                    price:req.body.price

                })
                item.save().then(data=>{
                    res.send(data)
                }).catch(err=>{
                    res.status(404).send({message:err.message || "something went wrong", status:false})
                })
            }
            else{
                res.status(404).send({message:"Invalid user Id" + req.params.id, status:false})
            }
        })
    }
    catch(error)
    {
        res.status(400).send({message:"error", status:false})
    }
}

exports.getAllItemsById=(req, res)=>{
    console.log(req.user.user_id)
    const setOptions=["name","description", "category", "price"]
    ItemSchema.find({owner:req.user.user_id}, setOptions).then(data=>{
        res.status(200).send(data)
    }).catch(err=>{
        res.status(401).send({message:err.message || "something went wrong"})
    })
}

exports.getAllItems=(req, res)=>{
    const setOptions=["name","description", "category", "price"]
    ItemSchema.find({},setOptions, (err, data)=>{
        res.json(data)
    })
   
}

exports.cart =async (req, res)=>{
    const id = req.params.id
    const { itemId, quantity } = req.body;
    try{
        const cart = await CartSchema.findOne({owner:req.params.id})
  
        const item = await ItemSchema.findOne({_id:itemId})
        console.log(item)
    
        if(!item){
            res.status(404).send({message:"Item not found"})
            return
        }
        const price=item.price
        console.log(price)
        const name =item.name
        if (cart){
            const item_index=cart.items.findIndex((item)=>item.itemId==itemId)
            console.log("item", item_index)
            console.log("2")
        
        if(item_index > -1){
            let product = cart.items.reduce((acc, curr)=>{
                return acc+curr.quantity*curr.price
            }, 0)
            console.log(product)
            cart.items[item_index]=product
            await cart.save()
            res.status(200).send(cart)
        }else{
            console.log("itemid",itemId)
            cart.items.push({itemID:itemId, name, quantity, price})
            cart.bill= cart.items.reduce((acc, curr)=>{
                return acc +curr.quantity*curr.price;
            }, 0)
            await cart.save()
            res.status(200).send(cart)
        }

        }
        else{
            console.log(id)
            const newCart = await CartSchema.create({owner:id, items:[{itemID:itemId, name, quantity, price}], bill:quantity*price})
            return res.status(201).send(newCart)
        }
    }
    catch(error)
    {
        console.log(error)
        res.status(500).send("something went wrong")

    }
}

exports.deleteItem =async (req, res)=>{
   const owner= req.params.id
   const itemId = req.body.itemId
   try{
        let cart=await CartSchema.findOne({owner:owner})
        console.log(cart)
        const itemIndex = cart.items.findIndex((item)=>item.itemID==itemId)
        console.log("dfgdf",itemIndex)
        if(itemIndex>-1){
            let item = cart.items[itemIndex]
            console.log(item.quantity)
            cart.bill -= item.quantity*item.price 
            if(cart.bill<0){
                cart.bill=0
            }  
            cart.items.splice(itemIndex, 1)
            cart.bill = cart.items.reduce((acc, curr)=>{
                return acc+curr.quantity*curr.price
            }, 0) 
            cart = await cart.save()
            res.status(200).send(cart)
        }
        else{
            res.status(404).send("item not found")
        }
   }catch(error){
    console.log(error)
    res.status(404).send("something went wrong")
   }
}
