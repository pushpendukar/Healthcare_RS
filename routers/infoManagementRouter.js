const express = require("express")
const request = require("request")
const pool = require("../database")
const router = express.Router()

// add a new doctor information entry in database
function doctoradd(req){
    return new Promise((resolve,reject) => {
        const sqlStr = "insert into doctor (id, name, hospital_id, score) values (?,?,?,?)"
        pool.query(sqlStr,[req.id,req.name,req.hospital_id,0.0],(err,results)=>{
            if(err){
                reject(err)
            }
            else{
                resolve("success")
            }
        })
    })
}

// router.post('/doctor/add', (req, res)=>{
//     const sqlStr = "insert into doctor (id, name, hospital_id, score) values (?,?,?,?,?)"
//     pool.query(sqlStr,[req.body.id,req.body.name,req.body.hospital_id,0.0],(err,results)=>{
//         if(err){
//             res.send(err)
//         }
//         else{
//             res.send({
//                 "message":"success",
//                 "id":results.insertId
//             })
//         }
//     })
// })

// add a new hospital information entry in database
function hospitaladd(req){
    return new Promise((resolve,reject) => {
        const sqlStr = "insert into hospital (id, name, description, location) values (?,?,?,?)"
        pool.query(sqlStr,[req.id,req.name,req.description,req.location],(err,results)=>{
            if(err){
                reject(err)
            }
            else{
                resolve("success")
            }
        })
    })
}

// router.post('/hospital/add', (req, res)=>{
//     const sqlStr = "insert into hospital (id, name) values (?,?)"
//     pool.query(sqlStr,[req.body.id,req.body.name],(err,results)=>{
//         if(err){
//             res.send(err)
//         }
//         else{
//             res.send({
//                 "message":"success",
//                 "id":results.insertId
//             })
//         }
//     })
// })

// send request to update information for hospital to approve
router.post('/doctor/update/request', (req, res)=>{
    const user = req.user
    if(user.type!=0){
        res.send({
            "code":403,
            "message":"Wrong user type! You are not allowed to visit."
        })
    }
    else {
        const searchSqlStr = "select hospital_id from doctor where id = ?"
        pool.query(searchSqlStr,user.id,(err,results)=>{
            if(err){
                res.send({
                    "code":400,
                    "message": "An error occurs."
                })
            }
            else{
                const hospital_id = results[0].hospital_id
                const sqlStr = "select * from doctorupdates where id = ?"
                pool.query(sqlStr,user.id,(err,results)=>{
                    if(err){
                        res.send({
                            "code":400,
                            "message": "An error occurs."
                        })
                    }
                    else if(results.length){
                        res.send({
                            "code":401,
                            "message":"Your last request is still pending, please wait"
                        })
                    }
                    else{
                        const body = req.body
                        const updateJSONStr = JSON.stringify(body)
                        const sqlStr = "insert into doctorupdates (id, hospital_id, updateJSON) values (?,?,?)"
                        pool.query(sqlStr,[user.id,hospital_id,updateJSONStr],(err,results)=>{
                            if(err){
                                res.send({
                                    "code":400,
                                    "message": "An error occurs."
                                })
                            }
                            else{
                                res.send({
                                    "code":200,
                                    "message":"request has been sent."
                                })
                            }
                        })
                    }
                })
            }
        })
    }
})

router.get('/check/get', (req, res)=>{
    const user = req.user
    if(user.type!=1){
        res.send({
            "code":403,
            "message":"Wrong user type! You are not allowed to visit."
        })
    }
    else{
        const hospital_id = user.id
        const searchSqlStr = "select * from doctorupdates where hospital_id = ?"
        pool.query(searchSqlStr,hospital_id,(err,results)=>{
            if(err){
                res.send({
                    "message": "An error occurs.",
                    "code":400
                })
            }
            else if(results.length){
                var returnValue = []
                for (const result of results) {
                    const updateJSON = JSON.parse(result.updateJSON)
                    var JSONresult = {
                        "id":result.id
                    }
                    if(updateJSON.name){
                        JSONresult["name"] = updateJSON.name
                    }
                    if(updateJSON.description){
                        JSONresult["description"] = updateJSON.description
                    }
                    if(updateJSON.tagsArr){
                        JSONresult["tagsArr"] = updateJSON.tagsArr
                    }
                    returnValue.push(JSONresult)
                }
                res.send({
                    "code":200,
                    "returnArray":returnValue
                })
            }
            else{
                res.send({
                    "code":201,
                    "message":"no update request."
                })
            }
        })
    }
})

router.post('/check/approve', async (req, res)=>{
    const user = req.user
    if(user.type!=1){
        res.send({
            "code":403,
            "message":"Wrong user type! You are not allowed to visit."
        })
    }
    else{
        id = req.body.id
        decision = req.body.decision
        if(decision == "approved"){
            const sqlStr = "select * from doctorupdates where id = ?"
            pool.query(sqlStr,id, async (err,results)=>{
                if(err){
                    res.send({
                        "message": "An error occurs.",
                        "code":400
                    })
                }
                else if (results.length){
                    const updateJSON = JSON.parse(results[0].updateJSON)
                    try{
                        if(updateJSON.name){
                            await updateDoctorName(updateJSON.name,id)
                        }
                        if(updateJSON.description){
                            await updateDoctorDescription(updateJSON.description,id)
                        }
                        if(updateJSON.tagsArr){
                            await updateDoctorTags(updateJSON.tagsArr,id)
                        }
                        await deleteUpdateRequest (id)
                        await updateRecord (id)
                        res.send({
                            "code":200,
                            "message":"successfully updated."
                        })
                    }
                    catch{
                        res.send({
                            "message": "An error occurs.",
                            "code":400
                        })
                    }
                }
                else{
                    res.send({
                        "code":401,
                        "message":"request does not exist."
                    })
                }
            })      
        }
        else if(decision == "rejected"){
            try{
                await deleteUpdateRequest(id)
                res.send({
                    "code":201,
                    "message":"successfully rejected."
                })
            }
            catch{
                res.send({
                    "message": "An error occurs.",
                    "code":400
                })
            }
        }
    }
})

function updateRecord (id) {
    return new Promise((resolve,reject) => {
        const insertSqlStr = "insert into doctormodify (id) values (?)"
        pool.query(insertSqlStr,id,(err,results)=>{
            if(err){
                reject(err)
            }
            else{
                resolve(true)
            }
        })     
    })
    
}

function deleteUpdateRequest (id){
    return new Promise((resolve,reject) => {
        const sqlStr = "delete from doctorupdates where id = ?"
        pool.query(sqlStr,id,(err,results)=>{
            if(err){
                reject(err)
            }
            else{
                resolve(true)
            }
        })     
    })
}

function updateDoctorName (name,id){
    return new Promise((resolve,reject) => {
        const sqlNameStr = "update doctor set name = ? where id = ?"
        pool.query(sqlNameStr,[name,id],(err,results)=>{
            if(err){
                reject(err)
            }
            else{
                resolve(true)
            }
        })  
    })
}

function updateDoctorDescription (description,id) {
    return new Promise((resolve,reject) => {
        const sqlDescripStr = "update doctor set description = ? where id = ?"
        pool.query(sqlDescripStr,[description,id],(err,results)=>{
            if(err){
                reject(err)
            }
            else{
                resolve(true)
            }
        })  
    })
}   

function updateDoctorTags (tagsArr,id) {
    return new Promise((resolve,reject) => {
        const searchAllSqlStr = "select * from doctortags where doctor_id = ?"
        pool.query(searchAllSqlStr,id,async (err,results)=>{
            if(err){
                reject(err)
            }
            for (const result of results) {
                flag = false
                for(let j = 0; j < tagsArr.length; j++){
                    if(tagsArr[j] === result.tag_name){
                        flag = true
                    }
                }
                if(!flag){
                    try{
                        await deleteTags(id,result.tag_name)
                    }
                    catch{
                        reject(err)
                    }
                }
            }
            for (const tag of tagsArr) {
                try{
                    await searchAndInsert(id,tag)
                }
                catch{
                    reject(err)
                }
            }
            resolve(true)
        })
    })
}

function searchAndInsert(id,tag){
    return new Promise((resolve,reject) => {
        const searchSqlStr = "select * from doctortags where doctor_id = ? and tag_name = ?"
        const insertSqlStr = "insert into doctortags (doctor_id, tag_name) values (?,?)"
        pool.query(searchSqlStr,[id, tag],(err,results)=>{
            resultLength = results.length
            if (resultLength === 0){
                pool.query(insertSqlStr,[id, tag],(err,results)=>{
                    if(err){
                        reject(err)
                    }
                    else{
                        resolve(true)
                    }
                })
            }
            else{
                resolve(true)
            }
        }) 
    })
}

function deleteTags(id, tag_name){
    return new Promise((resolve,reject) => {
        const deleteSqlStr = "delete from doctortags where doctor_id = ? and tag_name = ?"
        pool.query(deleteSqlStr,[id, tag_name],(err,results)=>{
            if(err){
                reject(err)
            }
            else{
                resolve(true)
            }
        })
    })
}

// get the information of doctors
router.get('/doctor/get', (req, res)=>{
    const user = req.user
    if(user.type!=0){
        res.send({
            "code":403,
            "message":"Wrong user type! You are not allowed to visit."
        })
    }
    else{
        const searchSqlStr = "select d.id,d.name as dname,h.name as hname,d.description,d.score,d.verified from doctor d inner join hospital h on d.hospital_id = h.id where d.id = ? "
        pool.query(searchSqlStr,user.id,(err,results)=>{
            if(err){
                res.send({
                    "message": "An error occurs.",
                    "code":400
                })
            }
            else if(results.length){
                const searchTagsSqlStr = "select tag_name from doctortags where doctor_id = ?"
                const doctorResult = results[0]
                pool.query(searchTagsSqlStr,user.id,(err,results)=>{
                    if(err){
                        res.send({
                            "message": "An error occurs.",
                            "code":400
                        })
                    }
                    else if(results.length){
                        tagsArr = []
                        for (const result of results) {
                            tagsArr.push(result.tag_name)
                        }
                        res.send({
                            "code":200,
                            "doctorInfo":doctorResult,
                            "doctorTags":tagsArr
                        })
                    }
                    else{
                        res.send({
                            "code":200,
                            "doctorInfo":doctorResult,
                            "doctorTags":[]                                                
                        })
                    }
                })
            }
            else{
                res.send({
                    "code":401,
                    "message":"no doctor information"
                })
            }
        })
    }
})

// get the information of hospital
router.get('/hospital/get', (req, res)=>{
    const user = req.user
    if(user.type!=1){
        res.send({
            "code":403,
            "message":"Wrong user type! You are not allowed to visit."
        })
    }
    else{
        const searchSqlStr = "select * from hospital where id = ?"
        pool.query(searchSqlStr,user.id,(err,results)=>{
            if(err){
                res.send({
                    "message": "An error occurs.",
                    "code":400
                })
            }
            else if(results.length){
                res.send({
                    "code":200,
                    "hospitalInfo":results[0]
                })
            }
            else{
                res.send({
                    "code":401,
                    "message":"no hospital information"
                })
            }
        })
    }
})

// get the hospital name lists
router.get('/hospital/list', (req, res)=>{
    const searchSqlStr = "select name,id,location,description from hospital where verified = true"
    pool.query(searchSqlStr,(err,results)=>{
        if(err){
            res.send({
                "message": "An error occurs.",
                "code":400
            })
        }
        else if(results.length){
            res.send({
                "code":200,
                "hospitalList":results
            })
        }
        else{
            res.send({
                "code":401,
                "message":"no hospital information"
            })
        }
    })
})

router.post('/hospital/update', async (req, res)=>{
    const user = req.user
    if(user.type!=1){
        res.send({
            "code":403,
            "message":"Wrong user type! You are not allowed to visit."
        })
    }
    else {
        try{
            const id = user.id
            const body = req.body
            if(body.name){
                await updateHospitalName(body.name,id)
            }
            if(body.description){
                await updateHospitalDescription(body.description,id)
            }
            if(body.location){
                await updateHospitalLocation(body.location,id)
            }
            res.send({
                "code":200,
                "message":"successfully updated."
            })
        }
        catch{
            res.send({
                "message": "An error occurs.",
                "code":400
            })
        }
    }
})      

function updateHospitalName (name,id) {
    return new Promise((resolve,reject) => {
        const sqlDescripStr = "update hospital set name = ? where id = ?"
        pool.query(sqlDescripStr,[name,id],(err,results)=>{
            if(err){
                reject(err)
            }
            else{
                resolve(true)
            }
        })  
    })
}   

function updateHospitalDescription (description,id) {
    return new Promise((resolve,reject) => {
        const sqlDescripStr = "update hospital set description = ? where id = ?"
        pool.query(sqlDescripStr,[description,id],(err,results)=>{
            if(err){
                reject(err)
            }
            else{
                resolve(true)
            }
        })  
    })
} 

function updateHospitalLocation (location,id) {
    return new Promise((resolve,reject) => {
        const sqlDescripStr = "update hospital set location = ? where id = ?"
        pool.query(sqlDescripStr,[location,id],(err,results)=>{
            if(err){
                reject(err)
            }
            else{
                resolve(true)
            }
        })  
    })
}   

module.exports = {
    router:router,
    doctoradd:doctoradd,
    hospitaladd:hospitaladd
}