const nodemailer = require('nodemailer')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })



const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtp = async(email,otp)=>{
        try {
        const info = await transporter.sendMail({
            from: `"OTP Verification" <${process.env.EMAIL_USER}>`, // sender address
            to: email, // list of recipients
            subject: "Your OTP Code ", // subject line
           
            html: `<h2> Your OTP is: ${otp} </h2>  <p> Valid for 5 minutes </p>`
        });

        console.log("Message sent:", info.messageId)

        return info
    } catch (err) {
        console.error("Error while sending mail:", err.message);
        throw err;  
    }
}

module.exports = sendOtp;