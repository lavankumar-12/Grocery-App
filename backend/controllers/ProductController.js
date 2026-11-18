const Product = require('../models/Product')

const createProduct = async(req,res)=>{
    try{
        const {name,desc,price, category,unit}=req.body;

        const check = await Product.findOne({name})
        if(check){
            return res.json({msg:"product already exists"})
        }
        const image = req.file ? `/uploads/${req.file.filename}` : null
        const products = await Product.create({
            name,desc,price, category,unit,image
        })

        return res.status(200).json({msg:"product added",products})
    }
    catch(error){
        console.error(error.message)
        return res.status(500).json({msg:error.message})
    }
}
const getProducts = async (req,res)=>{
    try{
        const newProducts = await Product.find();
        return res.status(200).json(
            {
                msg:"products fetched successflly",
                products: newProducts
        });
    }   
    catch(error){
        console.error(error.message)
        return res.status(500).json({msg:error.message})
    }
}
module.exports = {createProduct,getProducts};