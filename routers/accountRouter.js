const express = require("express")
const request = require("request")
const info = require("./infoManagementRouter")
const jwt = require('jsonwebtoken')
const config = require("../config")
const router = express.Router()

router.post("/register",(req,res) =>{
    const reqbody = req.body
    request({
        url: config.blockChainServiceURL+'/blockchain/register',
        method: "POST",
        json: true,
        headers: {"content-type": "application/json"},
        body: req.body
    }, function(err, response, body) {
        returnValue = body
        if(err){
            res.send({
                "code":400,
                "message": "An error occurs.",
            })
        }
        else{
            if(returnValue.message === "exist"){
                res.send({
                    "code":401,
                    "message":"The user name has already existed."
                })
            }
            else if(returnValue.message === "created"){ 
                type = reqbody.type
                if(type===0){
                    var doctorname
                    var hospital_id
                    if(req.body.name){
                        doctorname = reqbody.name
                    }
                    else{
                        res.send({
                            "code":400,
                            "message": "An error occurs.",
                        })        
                        return                
                    }
                    if(req.body.hospital_id){
                        hospital_id = reqbody.hospital_id
                    }
                    else{
                        res.send({
                            "code":400,
                            "message": "An error occurs.",
                        })
                        return
                    }
                    // if it is a doctor account
                    try {
                        info.doctoradd({"id":returnValue.id,"name":doctorname,"hospital_id":hospital_id})
                        res.send({
                            "code":200,
                            "message":"The account has been created successfully."
                        })                        
                    } catch (error) {
                        res.send({
                            "code":400,
                            "message": "An error occurs.",
                        })                        
                    }
                    // request({
                    //     url: 'http://localhost:1266/info/doctor/add',
                    //     method: "POST",
                    //     json: true,
                    //     headers: {"content-type": "application/json"},
                    //     body: {"id":returnValue.id,"name":doctorname,"hospital_id":hospital_id}
                    // },function(err, response, body){
                    //     if(err) {res.send({
                    //         "code":400,
                    //         "message": "An error occurs.",
                    //     })}
                    //     else{
                    //         res.send({
                    //             "code":200,
                    //             "message":"The account has been created successfully."
                    //         })
                    //     }
                    // })
                }
                else if(type===1){
                    // if it is a hospital account
                    // request({
                    //     url: 'http://localhost:1266/info/hospital/add',
                    //     method: "POST",
                    //     json: true,
                    //     headers: {"content-type": "application/json"},
                    //     body: {"id":returnValue.id}
                    // },function(err, response, body){
                    //     if(err) {res.send({
                    //         "code":400,
                    //         "message": "An error occurs.",
                    //     })}
                    //     else{
                    //         res.send({
                    //             "code":200,
                    //             "message":"The account has been created successfully."
                    //         })
                    //     }
                    // })
                    var hospitalname
                    var hospitaldescription
                    if(req.body.name){
                        hospitalname = reqbody.name
                    }
                    else{
                        res.send({
                            "code":400,
                            "message": "An error occurs.",
                        })
                        return                        
                    }
                    if(req.body.description){
                        hospitaldescription = reqbody.description
                    }
                    else{
                        res.send({
                            "code":400,
                            "message": "An error occurs.",
                        })
                        return
                    }
                    if(req.body.location){
                        hospitallocation = reqbody.location
                    }
                    else{
                        res.send({
                            "code":400,
                            "message": "An error occurs.",
                        })
                        return
                    }
                    try {
                        info.hospitaladd({"id":returnValue.id,"name":hospitalname,"description":hospitaldescription,"location":hospitallocation})
                        res.send({
                            "code":200,
                            "message":"The account has been created successfully."
                        })                        
                    } catch (error) {
                        res.send({
                            "code":400,
                            "message": "An error occurs.",
                        })                        
                    }
                }
                else{
                    res.send({
                        "code":200,
                        "message":"The account has been created successfully."
                    })
                }
            }
            else if(returnValue.message === "doctororder overflow"){
                res.send({
                    "code":402,
                    "message":"The user number has reached its limitation."
                })
            }
            else{
                res.send({
                    "code":400,
                    "message": "An error occurs.",
                })                  
            }
        }
    })
})

router.post("/login",(req,res) =>{
    user = req.body
    request({
        url: config.blockChainServiceURL+'/blockchain/login',
        method: "POST",
        json: true,
        headers: {"content-type": "application/json"},
        body: user
    }, function(err, response, body) {
        returnValue = body
        if(err){
            res.send({
                "code":400,
                "message": "An error occurs.",
            })
        }
        else{
            if(returnValue.message ==="not exist"){
                res.send({
                    "code":401,
                    "message": "The user name does not exist."
                })
            }
            else if(returnValue.message === "not match"){
                res.send({
                    "code":402,
                    "message": "Wrong password"
                })
            }
            else if(returnValue.message === "match"){
                token = jwt.sign({id:returnValue.id, type: returnValue.type}, config.secreteKey, {expiresIn: config.expiresIn})
                res.send({
                    "code": 200,
                    "message": 'Login successfully',
                    "token": "Bearer " + token,
                    "type": returnValue.type
                })
            }
        }
    })
})

router.post("/password",(req,res) =>{
    username = req.body.username
    email = req.body.email
    request({
        url: config.blockChainServiceURL+'/blockchain/password',
        method: "POST",
        json: true,
        headers: {"content-type": "application/json"},
        body: {"username":username,"email":email}
    }, function(err, response, body) {
        if(err){
            res.send({
                "code":400,
                "message": "An error occurs."
            })
        }
        else if(body.message === "not match"){
            res.send({
                "code":401,
                "message":"username or email is incorrect."
            })
        }
        else{
            password = body.password
            request({
                url: 'http://localhost:1266/email/password',
                method: "POST",
                json: true,
                headers: {"content-type": "application/json"},
                body: {"password":password,"email":email}
            }, function(err, response, body) {
                if(err){
                    res.send({
                        "code":400,
                        "message": "An error occurs."
                    })
                }
                else{
                    res.send({
                        "code":200,
                        "message":body.message
                    })
                }
            })
        }
    })
})

module.exports = router