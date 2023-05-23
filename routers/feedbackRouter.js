const express = require("express")
const request = require("request")
const pool = require("../database")
const config = require("../config")
const router = express.Router()

router.post("/send", (req, res) => {
    const user = req.user
    // only type2 (patient) have the access
    if (user.type != 2) {
        res.send({
            "code": 403,
            "message": "Wrong user type! You are not allowed to visit."
        })
    }
    else {
        id = user.id
        doctor_id = req.body.doctor_id
        score = req.body.score
        comment = ""
        if (req.body.comment) {
            comment = req.body.comment
        }
        request({
            url: config.blockChainServiceURL + '/blockchain/feedback',
            method: "POST",
            json: true,
            headers: { "content-type": "application/json" },
            body: { "patient_id": id, "doctor_id": doctor_id, "score": score, "comment": comment }
        }, function (err, response, body) {
            if (body.message === "success") {
                res.send({
                    "code": 200,
                    "message": "your request has been submitted"
                })
            }
            else {
                res.send({
                    "message": "An error occurs.",
                    "code": 400
                })
            }
        })
    }
})

router.get("/get", (req, res) => {
    const user = req.user
    // only type0 (doctor) have the access
    if (user.type != 0) {
        res.send({
            "code": 403,
            "message": "Wrong user type! You are not allowed to visit."
        })
    }
    else {
        id = user.id
        request({
            url: config.blockChainServiceURL + '/blockchain/feedback/list',
            method: "POST",
            json: true,
            headers: { "content-type": "application/json" },
            body: { "id": id }
        }, function (err, response, body) {
            if (body.message === "success") {
                // contains [{name:,id:}]
                patientArray = body.patientArray
                res.send({
                    "code": 200,
                    "patientArray": patientArray
                })
            }
            else {
                res.send({
                    "message": "An error occurs.",
                    "code": 400
                })
            }
        })
    }
})

router.post("/approve", (req, res) => {
    const user = req.user
    // only type0 (doctor) have the access
    if (user.type != 0) {
        res.send({
            "code": 403,
            "message": "Wrong user type! You are not allowed to visit."
        })
    }
    else {
        id = user.id
        patient_id = req.body.id
        request({
            url: config.blockChainServiceURL + '/blockchain/feedback/approve',
            method: "POST",
            json: true,
            headers: { "content-type": "application/json" },
            body: { "doctor_id": id, "patient_id": patient_id }
        }, function (err, response, body) {
            if (body.message === "success") {
                newscore = body.score
                const sqlUpdateStr = "update doctor set score = ? where id = ?"
                pool.query(sqlUpdateStr, [newscore, id], (err, results) => {
                    if (err) {
                        res.send({
                            "message": "An error occurs.",
                            "code": 400
                        })
                    }
                    else {
                        res.send({
                            "code": 200
                        })
                    }
                })
            }
            else {
                res.send({
                    "message": "An error occurs.",
                    "code": 400
                })
            }
        })
    }
})

module.exports = router