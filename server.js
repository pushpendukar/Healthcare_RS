const express = require('express')
const mysql = require ('mysql')
const jwt = require('jsonwebtoken')
const expressJWT = require('express-jwt')
const swaggerUi = require('swagger-ui-express')
const nodeSchedule = require('node-schedule')
const swaggerDocument = require('./swagger.json')
const pool = require('./database')
const accountRouter = require("./routers/accountRouter")
const infoManagementRouter = require("./routers/infoManagementRouter")
const emailRouter = require("./routers/emailRouter")
const feedbackRouter = require("./routers/feedbackRouter")
const verificationRouter = require("./routers/verificationRouter")
const recommendation = require("./routers/recommendationRouter")
const config = require("./config")
const app = express()

// static resources
app.use(express.static('static'))
// parse JSON request body
app.use(express.json())
// parse url-encoded
app.use(express.urlencoded({extended: false}))
// to create docs
app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(swaggerDocument))
// jwt / jwt path exclude config
app.use(expressJWT({secret: config.secreteKey, algorithms: config.tokenAlgorithem}).unless({ path: config.pathNoCheck }))
// middleware to handle errors
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        return res.send({ 
            message: 'Invalid token' 
        })
    }
})

// routers
// manage account
app.use("/account",accountRouter)
// information management 
app.use("/info",infoManagementRouter.router)
// email management
app.use("/email",emailRouter)
// to verificate registration
app.use("/verification",verificationRouter)
// interact with recommendation model
app.use("/recommendation",recommendation.router)
// feedback sub-system
app.use("/feedback",feedbackRouter)
// connect to database
pool.getConnection((err,connection)=>{
    if(err){
        console.log("error happens during connection");
    }
    else{
        console.log("successfully connected to database");
    }
})

nodeSchedule.scheduleJob({hour: 22, minute: 42}, function(){
    recommendation.update()
})

// port
app.listen(1266,()=>{
})