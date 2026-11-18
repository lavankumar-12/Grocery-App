const mongoose = require('mongoose')

const Category_Enum =[
    "vegetables", "fruits", "food grains"
]

const Unit_Enum=[
    "500g" , "1kg", "2kg", "5kg"
]

const ProductSchema = new mongoose.Schema({
    name:{
        type : String,
        required: true,
        unique:true
    },
    desc:{
        type:String,
        required: true
    },
    price:{
        type:Number
    },
    category:{
        type: String,
        values:Category_Enum
    },
    unit:{
        type:String,
        values:Unit_Enum 
    },
    image:{
        type: String
    },
    isActive:{
        type:Boolean
    }
     

     
}, {timestamps:true}) 

module.exports = mongoose.model("Product",ProductSchema)