const jwt = require('jsonwebtoken')

const emailMiddleware = (req,res,next)=>{
    const token = req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({msg:"Un-authorized user"})
    }
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY)
        if(!decoded._id){
            return res.status(403).json({msg:"Customer authentication required"})
        }
        req.userId= decoded._id
        req.userEmail= decoded.email
        next()
    }
    catch(err){
        return res.status(403).json({msg:"Invalid Token"})
    }
}

module.exports ={emailMiddleware}