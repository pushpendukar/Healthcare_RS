module.exports = {
    secreteKey: "GRPUserKey",
    expiresIn: "12h",
    pathNoCheck: [  "/account/login","/account/register","/account/password",
                    "/blockchain/login","/blockchain/register","/blockchain/password",
                    "/info/doctor/add","/info/hospital/list",
                    "/email/password",
                    "/api-docs",
                    "/recommendation/test"
    ],
    tokenAlgorithem:  ["HS256"],
    emailAddress:"forstudyuseonly1@163.com",
    emailAuthorizationPassword:"JEHMUQIPOPVJZLTI",
    blockChainServiceURL:"http://47.102.152.210:8080",
    recommendationURL:"http://127.0.0.1:8848/Recommender_System",
    recommendationUpdateURL:"http://127.0.0.1:8848/update_TFIDF_matrix",
}