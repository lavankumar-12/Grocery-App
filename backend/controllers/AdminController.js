const jwt = require('jsonwebtoken')
const bcrypt= require('bcrypt')

const Admin = require('../models/Admin')

const adminRegister = async (req,res)=>{
    try{
        const {name,email,password} = req.body;

        const adminRecord = await Admin.findOne({email})

        if(adminRecord){
            return res.status(400).json({msg:"email already exists"})
        }

        const hashedPassword = await bcrypt.hash(password,10)

        const admin = await Admin.create({
            name,email,password:hashedPassword
        })
        
        return res.status(201).json({msg:"Admin registerd success"})
    }
    catch(err){
        return res.status(501).json({msg:err.message})
    }

}

const adminLogin = async (req,res)=>{
    try{
        const {name,email,password}= req.body;

        const adminuser = await Admin.findOne({email})

        if(!adminuser){
            return res.status(400).json({msg:"Invalid Admin User"})
        }

       // const hashedPassword = await bcrypt.hash(password,10)
        
        const isMatch = await bcrypt.compare(password,adminuser.password)

        if(!isMatch){
            return res.status(400).json({msg:"Incorrect password"})
        }

        const token = jwt.sign(
            {adminId:adminuser._id} ,
            process.env.JWT_SECRET_KEY,
            {expiresIn:"1d"}
            
        )
        return res.status(200).json({
            msg:"login successfull",
            token:token,
            admin:{ name: adminuser.name, email: adminuser.email }
        })
    }
    catch(err){
        return res.status(500).json({msg:err.message})
    }
}

const verifyAdmin = async (req,res)=>{
    try{
        const admin = await Admin.findById(req.adminId).select("-password")
        if(!admin){
            return res.status(401).json({msg:"Admin account not found"})
        }
        return res.status(200).json({
            authenticated:true,
            admin:{ id: admin._id, name: admin.name, email: admin.email }
        })
    }
    catch(err){
        return res.status(500).json({msg:err.message})
    }
}


module.exports = {adminRegister,adminLogin,verifyAdmin}