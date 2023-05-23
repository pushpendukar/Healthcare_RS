const express = require("express")
const request = require("request")
const pool = require("../database")
const router = express.Router()

router.get("/unverified/doctor",(req,res)=>{
    const user = req.user
    // only type1 (hospital) have the access
    if(user.type!=1){
        res.send({
            "code":403,
            "message":"Wrong user type! You are not allowed to visit."
        })
    }
    else{
        const hospital_id = user.id
        const sqlStr = "select * from doctor where verified = false and hospital_id = ?"
        pool.query(sqlStr,hospital_id,(err,results)=>{
            if(err){
                res.send({
                    "message": "An error occurs.",
                    "code":400
                })
            }
            else{
                if(results.length){
                    res.send({
                        "code":200,
                        retrunArray:results
                    })
                }
                else{
                    res.send({
                        "code":201,
                        "message":"no unverified doctors"
                    })
                }
            }
        })
    }
})

router.post("/verified/doctor",(req,res)=>{
    const user = req.user
    // only type1 (hospital) have the access
    if(user.type!=1){
        res.send({
            "code":403,
            "message":"Wrong user type! You are not allowed to visit."
        })
    }
    else{
        const hospital_id = user.id
        const doctor_id = req.body.id
        const searchSqlStr = "select * from doctor where id = ?"
        pool.query(searchSqlStr,doctor_id,(err,results)=>{
            if(err){
                res.send({
                    "code":400,
                    "message": "An error occurs.",
                })
            }
            else{
                if(results[0].hospital_id != hospital_id){
                    res.send({"code":401,"message":"doctor is not in your hospital"})
                }
                else{
                    const updateSqlStr = "update doctor set verified = true where id = ?"
                    pool.query(updateSqlStr,doctor_id,(err,results)=>{
                        if(err){
                            res.send({
                                "code":400,
                                "message": "An error occurs.",
                            })
                        }
                        else{
                            const insertSqlStr = "insert into doctormodify (id) values (?)"
                            pool.query(insertSqlStr,doctor_id,(err,results)=>{
                                if(err){
                                    res.send({
                                        "code":400,
                                        "message": "An error occurs.",
                                    })
                                }
                                else{
                                    res.send({
                                        "code":200,
                                        "message":"successfully verified"
                                    })
                                }
                            })     
                        }
                    })
                }
            }
        })
    }
})

router.get("/unverified/hospital",(req,res)=>{
    const user = req.user
    // only type3 (maintainer) have the access
    if(user.type!=3){
        res.send({
            "code":403,
            "message":"Wrong user type! You are not allowed to visit."
        })
    }
    else{
        const hospital_id = user.id
        const sqlStr = "select * from hospital where verified = false"
        pool.query(sqlStr,hospital_id,(err,results)=>{
            if(err){
                res.send({
                    "message": "An error occurs.",
                    "code":400
                })
            }
            else{
                if(results.length){
                    res.send({
                        "code":200,
                        retrunArray:results
                    })
                }
                else{
                    res.send({
                        "code":201,
                        "message":"no unverified hospitals"
                    })
                }
            }
        })
    }
})

router.post("/verified/hospital",(req,res)=>{
    const user = req.user
    // only type3 (maintainer) have the access
    if(user.type!=3){
        res.send({
            "code":403,
            "message":"Wrong user type! You are not allowed to visit."
        })
    }
    else{
        const hospital_id = req.body.id
        const updateSqlStr = "update hospital set verified = true where id = ?"
        pool.query(updateSqlStr,hospital_id,(err,results)=>{
            if(err){
                res.send({
                    "code":400,
                    "message": "An error occurs.",
                })
            }
            else{
                res.send({
                    "code":200,
                    "message":"successfully verified"
                })
            }
        })
    }
})

module.exports = router