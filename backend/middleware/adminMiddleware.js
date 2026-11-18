const jwt = require('jsonwebtoken')

const adminMiddleware = (req,res,next)=>{
    const token = req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({msg:"Un-authorized user"})
    }
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY)
        if(!decoded.adminId){
            return res.status(403).json({msg:"Admin access required"})
        }
        req.adminId= decoded.adminId
        next()
    }
    catch(err){
        return res.status(403).json({msg:"Invalid Token"})
    }
}

module.exports ={adminMiddleware}