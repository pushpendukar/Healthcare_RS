const express = require("express")
const request = require("request")
const pool = require("../database")
const config = require("../config")
const router = express.Router()

const locmap = new Map()
locmap.set("Popcorn Central",[1,1])
locmap.set("Ice Cream Road",[2134,123])
locmap.set("Bikini Bottom",[11784,328])
locmap.set("Coffee Plaza",[536,4732])
locmap.set("CSer Building",[156,712])
locmap.set("Shuangye University",[3793,4938])

router.post("/search",(req,res) =>{
    const user = req.user
    if(user.type!=2){
        res.send({
            "code":403,
            "message":"Wrong user type! You are not allowed to visit."
        })
    }
    else{
        reqbody = req.body
        reqbody['userid'] = user.id
        request({
            url: config.recommendationURL,
            method: "POST",
            json: true,
            headers: {"content-type": "application/json"},
            body: reqbody
        }, async function(err, response, body) {
            if(err){
                res.send({
                    "message": "An error occurs.",
                    "code":400
                })
            }
            else{
                ids = body.ids
                const doctorArray = []
                try {
                    if(req.body.location){
                        patientLoc = req.body.location
                        for (const id of ids) {
                            result = await searchDoctor(id+1)
                            if (result === "not verified"){
                                continue;
                            }
                            resultTags = await searchTags(id+1)
                            distance = await calculateDistance(result,patientLoc)
                            result['tagsArr'] = resultTags.tagsArr
                            result['distance'] = distance
                            doctorArray.push(result)
                        }
                        doctorArray.sort(compare)
                        res.send({
                            "code":200,
                            "doctorArray":doctorArray
                        })
                    }
                    else{
                        for (const id of ids) {
                            result = await searchDoctor(id+1)
                            if (result === "not verified"){
                                continue;
                            }
                            resultTags = await searchTags(id+1)
                            result['tagsArr'] = resultTags.tagsArr
                            doctorArray.push(result)
                        }
                        res.send({
                            "code":200,
                            "doctorArray":doctorArray
                        })
                    }
                } catch (error) {
                    res.send({
                        "message": "An error occurs.",
                        "code":400
                    })
                }
            }
        })
    }
})

router.post("/doctor/info", async (req,res) =>{
    const user = req.user
    if(user.type!=2){
        res.send({
            "code":403,
            "message":"Wrong user type! You are not allowed to visit."
        })
    }
    else{
        const doctor_id = req.body.doctor_id
        try {
            result = await searchDoctor(doctor_id)
            resultTags = await searchTags(doctor_id)
            result['tagsArr'] = resultTags.tagsArr
            res.send({
                "code":200,
                "doctor":result
            })
        } catch (error) {
            res.send({
                "message": "An error occurs.",
                "code":400
            })            
        }
    }
})

function searchDoctor (id) {
    return new Promise((resolve,reject) => {
        const searchSqlStr = "select d.id,d.name as dname,h.name as hname,h.location,d.description,d.score,d.verified from doctor d inner join hospital h on d.hospital_id = h.id where d.id = ? and d.verified = true and h.verified = true"
        pool.query(searchSqlStr,id,(err,results)=>{
            resultLength = results.length
            if (err){
                reject(err)
            }
            else if(resultLength === 0){
                resolve("not verified")
            }
            else{
                resolve(results[0])
            }
        }) 
    })
} 

function update () {
    const searchSqlStr = "select distinct * from doctormodify order by id desc"
    pool.query(searchSqlStr, async (err,results)=>{
        if(results.length > 0){
            var updateDoctorList = []
            try {
                for (const result of results) {
                    const id = result.id
                    doctorup = await searchTags(id)
                    doctorup.id=doctorup.id-1
                    updateDoctorList.push(doctorup)
                    await deleteUpdate(id)
                }
                request({
                    url: config.recommendationUpdateURL,
                    method: "POST",
                    json: true,
                    headers: {"content-type": "application/json"},
                    body: {"doctorArray":updateDoctorList}
                }, function(err, response, body) {
                    if(err){
                        console.log("update error")
                    }
                    else{
                        console.log("update success")
                    }
                })
            } catch (error) {
                console.log("error happens in update")
            }
        }  
        else{
            console.log("no update")
        }
    }) 
} 

// this is to delete the update record of this day to leave for the next day record 
function deleteUpdate (id){
    return new Promise((resolve,reject) => {
        const sqlStr = "delete from doctormodify where id = ?"
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

// this is to search all the tags of doctors who got updated their information (account verified, information update approved)
function searchTags (id) {
    return new Promise((resolve,reject) => {
        const searchTagSqlStr = "select tag_name from doctortags where doctor_id = ?"
        var tagsArr = []
        pool.query(searchTagSqlStr,id,(err,results)=>{
            if(err){
                reject(err)
            }
            else{
                if(results.length>0){
                    for (const result of results) {
                        tagsArr.push(result.tag_name)
                    }
                }
                resolve({
                    "id":id,
                    "tagsArr":tagsArr
                })
            }
        })
    })
} 

function calculateDistance(doctor,patientLoc){
    return new Promise((resolve,reject) => {
        try {
            patientAxis = locmap.get(patientLoc)
            hospitalAxis = locmap.get(doctor.location)
            px = patientAxis[0]
            py = patientAxis[1]
            hx = hospitalAxis[0]
            hy = hospitalAxis[1]
            distance = Math.sqrt(Math.pow(px-hx,2) + Math.pow(py-hy,2))
            resolve (distance)  
        } catch (error) {
            reject(error)
        }
    })
}

function compare(doctor1,doctor2){
    if(doctor1.distance>doctor2.distance){
        return 1
    }
    else{
        return -1
    }
}

module.exports = {
    router:router,
    update:update
}