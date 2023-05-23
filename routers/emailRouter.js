const express = require("express")
const nodemailer = require("nodemailer")
const config = require("../config")
const router = express.Router()
  
router.post('/password', (req, res)=>{
    transporter = nodemailer.createTransport({
        host: "smtp.163.com",
        port: 465,
        secure: true,
        auth: {
            user: config.emailAddress,
            pass: config.emailAuthorizationPassword
        }
    })
    var options = {
        from: config.emailAddress,
        to: req.body.email,
        subject: "Retrieve Password",
        html:"<p>Your password is:<b>"+req.body.password+"</b></p><p>Please keep it secretly, do not send it to other poeple</p>"
    }
    transporter.sendMail(options,(error, info)=>{
        if (error) {
            res.send({"message":"error"})
        }
        else{
            res.send({"message":"The email has been sent, please check."})
        }
    })
})

module.exports = router