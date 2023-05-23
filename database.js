const mysql = require ('mysql')

const pool = mysql.createPool({
    host: '101.43.9.203',
    user: 'grp',
    password: '73eNWTTiRtPCHxkD',
    database: 'grp'
})

module.exports = pool