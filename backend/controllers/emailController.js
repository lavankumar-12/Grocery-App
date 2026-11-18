const User = require('../models/User')
const sendOtpEmail = require('../email/sendOtp')
const generateOtp = require('../email/generateOtp')

const jwt = require('jsonwebtoken')

const sendOtp = async (req,res)=>{
    try{
        
        const {name,email,mode}= req.body;

        if(!email){
            return res.status(400).json({msg:"Email required"})
        }
        let user = await User.findOne({email})

        if(mode === "register" && user){
            return res.status(400).json({msg:"Email already registered. Please sign in instead."})
        }

        if(mode === "login" && !user){
            return res.status(404).json({msg:"No account found with this email. Please register first."})
        }

        if(!user){
            if(!name || !name.trim()){
                return res.status(400).json({msg:"Full name is required to register"})
            }
            user = await User.create({name: name.trim(), email})
        }

        const otp = generateOtp()
        user.otp = otp
        user.otpExpires = Date.now() + 5*60*1000
        await user.save()

        await sendOtpEmail(email,otp)
        
        return  res.status(200).json({
            success:true,
            message:"OTP sent to your email",
            name: user.name
        })

    }
    catch(err){
        res.status(500).json({msg:err.message})
    }
}

const verifyOtp = async (req,res)=>{
    try{
        const {email,otp} = req.body;

        if(!email || !otp){
            return res.status(400).json({msg:"Email and OTP Required"})
        }

        const user =  await User.findOne({email})
        if(!user){
            return res.status(400).json({msg:"User not found"})
        }

        if(!user.otp || user.otp !== otp){
            return res.status(400).json({msg:"Invalid OTP"})
        }
        
        if(user.otpExpires < Date.now()){
            return res.status(400).json({msg:"OTP Expired"})
        }

        user.otp = undefined
        user.otpExpires= undefined
        await user.save()


        const token = jwt.sign(
            {_id:user._id, email:user.email}, process.env.JWT_SECRET_KEY , {expiresIn:"1d"}
        )
        return res.status(200).json(
            { 
                success:true,
                token,
                user: { name: user.name, email: user.email }
            }
        )
    }
    catch(err){
        return res.status(500).json({msg:err.message})
    }

}   
module.exports = {sendOtp,verifyOtp}