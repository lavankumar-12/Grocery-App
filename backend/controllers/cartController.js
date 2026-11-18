const Cart = require('../models/Cart')
const Product = require('../models/Product')


const addToCart = async (req,res)=>{
    try{
        const userId = req.userId;
        const {productId,quantity} = req.body;
        if(quantity<1){
            return res.status(400).json({msg:"Pls Add a product"})
        }
        const productExists= await Product.findById(productId)
        if(!productExists){
            return res.status(400).json({msg:"Product not found"})
        }
        
        let cart = await Cart.findOne({user:userId})
        if(!cart){
            cart = await Cart.create({
                user:userId,
                items:[{product:productId,quantity}]
            })
            return res.status(200).json({
            success:true,
            message:"Card Created and Product added",
            cart
            })
        }

        const itemIndex = await cart.items.findIndex(
            item =>item.product.toString() === productId
        )

        if(itemIndex > -1){
            cart.items[itemIndex].quantity += quantity
        }
        else{
            cart.items.push({product:productId,quantity})
        }

        await cart.save()

        return res.json({
            success:true,
            message:"Product added successfully"
        })
    }
    catch(err){
            return res.status(500).json({msg:err.message})
    }
}

const getCartItems = async(req,res)=>{
    try{
        const cart= await Cart.findOne({user:req.userId})
        .populate("user","email")
        .populate("items.product")
        if(!cart){
            return res.status(400).json({msg:"Cart not found"})
        }
        return res.json({sucess:true,cart})
    }
    catch(err){
        console.log(err.message)
        res.status(500).json({msg:err.message})
    }
}

const removeCartItem = async (req, res) => {
    try {
        const cart = await Cart.findOneAndUpdate(
            { user: req.userId },
            {
                $pull: {
                    items: { product: req.params.productId }
                }
            },
            { new: true }
        );

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product Removed",
            cart
        });
    }
    catch (err) {
        return res.status(500).json({
            msg: err.message
        });
    }
};


module.exports = {addToCart,getCartItems,removeCartItem};