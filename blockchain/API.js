const express = require('express');
const app = express();
const port = 8080;
const Blockchain = require('./Blockchain')
const Encryption = require('./AES')
const blockchain = new Blockchain()
const encryption = new Encryption()
var doctororder = 0;
var hospitalorder = 0;
var patientorder = 0;
var maintainerorder = 0;
var key = "test";

const fs = require('fs');
const e = require('express');
var linenum = 0;
const localvariable = fs.readFileSync('localvariable.txt', 'utf-8');
localvariable.split(/\r?\n/).forEach(line => {
    // console.log("test");
    console.log(`Line from file: ${line}`);
    linenum = linenum + 1;
    if (linenum === 1) {
        doctororder = Number(line);
        console.log(doctororder);
    }
    if (linenum === 2) {
        hospitalorder = Number(line);
        console.log(hospitalorder);
    }
    if (linenum === 3) {
        patientorder = Number(line);
        console.log(patientorder);
    }
    if (linenum === 4) {
        maintainerorder = Number(line);
        console.log(maintainerorder);
    }
});

app.use(express.json());


app.get('/', (req, res) => {
    res.send('test get')
})

// 验证登录
app.post('/blockchain/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const type = req.body.type;

    if (
        typeof username !== 'string' ||
        typeof password !== 'string' ||
        typeof type !== 'number'
    ) {
        return res.status(400).json({ error: 'Invalid input' });
    }
    let lineCounter = 0;
    var thename = 0;
    var thepassword = 100;
    var flag = 0;
    var id = 1;

    const fs = require('fs');
    // console.log(encryption.encrypter(doctororder.toString(), key));
    const userInfodata = fs.readFileSync('userInfodata.txt', 'utf-8');
    userInfodata.split(/\r?\n/).forEach(line => {
        // console.log("test");
        var line = encryption.decrypter(line, key);
        // console.log(encryption.decrypter(line, key));
        console.log(`Line from file: ${line}`);
        lineCounter = lineCounter + 1;
        if (line === username && lineCounter % 5 === 2) {

            thename = lineCounter;
            // console.log(`the line:::::::::::: ${line}`);
            // console.log(`the username:::::::::: ${username}`);
            // console.log(`the thename:::::::::: ${thename}`);
            flag = 1;
        }
        if (lineCounter === thename + 2) {
            // console.log(`the user name: ${thename}`);
            // console.log(`??????????????????: ${line}`);
            if (line === password) {
                flag = 2;
                // match
            }
        }
    });
    if (flag === 2) {
        lineCounter = 0;
        userInfodata.split(/\r?\n/).forEach(line => {
            var line = encryption.decrypter(line, key);
            lineCounter = lineCounter + 1;
            if (lineCounter === thename - 1) {
                id = Number(line);
            }
            // console.log(`Line from file: ${line}`);
        });
        console.log(id);
        if (id >= type * 1000 && id <= type * 1000 + 1000) {
            message = "match";
            res.json({ message, type, id });
        } else {
            message = "not match";

            res.json({ message });
        }

    } else if (flag === 0) {
        message = "not exist";
        res.json({ message });
    } else {
        message = "not match";
        console.log("test");
        res.json({ message });
    }
});

// 添加信息到区块链
app.post('/blockchain/register', (req, res) => {
    // "username": "abc",
    // "password": "123456",
    // "email": "abc@123.com",
    // "type": "0",0是医生 1是hospital 2是医院 3是maintainer
    // "name": "XXX",
    // "hospital_id": 999 
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const type = req.body.type;
    const name = req.body.name;
    var flag = 0;

    const fs = require('fs');
    const userInfodata = fs.readFileSync('userInfodata.txt', 'utf-8');
    userInfodata.split(/\r?\n/).forEach(line => {
        // console.log("test");
        var line = encryption.decrypter(line, key);
        console.log(`Line from file: ${line}`);
        if (line === username) {
            flag = 1;
        }
    });
    if (flag === 1) {
        message = "exist";
        console.log(message);
        res.json({ message });
    } else {
        if (type === 0) {
            if (doctororder >= 1000) {
                message = "doctororder overflow";
                res.json({ message });
                return 0;
            }
            doctororder = doctororder + 1;

            blockchain.mineToAddInfo(doctororder, username, name, password, email);
            const fs = require('fs');


            const filePath = 'localvariable.txt';

            // fs.writeFile(filePath, '1231231', { flag: "a" }, (err) => {

            // console.log(encryption.encrypter(doctororder.toString(), key));
            fs.writeFile(filePath, doctororder.toString() + "\n" + hospitalorder.toString() + "\n" + patientorder.toString() + "\n" + maintainerorder.toString(), (err) => {
                if (err) {
                    console.error('Error', err);
                }
            });
            var id = doctororder;
            message = 'created';
            res.json({ message, type, id });
            console.log(message);
            console.log(type);
            console.log(id);
        } else if (type === 1) {
            if (hospitalorder >= 2000) {
                message = "hospitalorder overflow";
                res.json({ message });
                console.log(message);
                return 0;
            }
            const fs = require('fs');
            const filePath = 'localvariable.txt';
            hospitalorder = hospitalorder + 1;
            blockchain.mineToAddInfo(hospitalorder, username, name, password, email);
            fs.writeFile(filePath, doctororder.toString() + "\n" + hospitalorder.toString() + "\n" + patientorder.toString() + "\n" + maintainerorder.toString(), (err) => {
                if (err) {
                    console.error('Error', err);
                }
            })
            var message = 'created';
            var id = hospitalorder;
            res.json({ message, type, id });
            console.log(message);
            console.log(type);
            console.log(id);
        }
        else if (type === 2) {
            if (patientorder >= 3000) {
                message = "patientorder overflow";
                res.json({ message });
                console.log(message);
                return 0;
            }
            const fs = require('fs');
            const filePath = 'localvariable.txt';
            patientorder = patientorder + 1;
            blockchain.mineToAddInfo(patientorder, username, name, password, email);
            fs.writeFile(filePath, doctororder.toString() + "\n" + hospitalorder.toString() + "\n" + patientorder.toString() + "\n" + maintainerorder.toString(), (err) => {
                if (err) {
                    console.error('Error', err);
                }
            })
            var message = 'created';
            var id = patientorder;
            res.json({ message, type, id });
        } else if (type === 3) {
            if (maintainerorder >= 4000) {
                message = "maintainerorder overflow";
                res.json({ message });
                return 0;
            }
            const fs = require('fs');
            const filePath = 'localvariable.txt';
            maintainerorder = maintainerorder + 1;
            blockchain.mineToAddInfo(maintainerorder, username, name, password, email);
            fs.writeFile(filePath, doctororder.toString() + "\n" + hospitalorder.toString() + "\n" + patientorder.toString() + "\n" + maintainerorder.toString(), (err) => {
                if (err) {
                    console.error('Error', err);
                }
            })
            var message = 'created';
            var id = maintainerorder;
            res.json({ message, type, id });
            console.log(message);
            console.log(type);
            console.log(id);
        }

    }




});

// 找回密码
app.post('/blockchain/password', (req, res) => {
    // "username": "abc",
    // "email": "abc@123.com",
    var username = req.body.username;
    var email = req.body.email;
    var password;
    var flag = 0;
    let lineCounter = 0;
    var thename = 0;
    var theemail = 100;


    // const type = req.body.type;
    const fs = require('fs');
    const userInfodata = fs.readFileSync('userInfodata.txt', 'utf-8');
    userInfodata.split(/\r?\n/).forEach(line => {
        // console.log("test");
        var line = encryption.decrypter(line, key);
        console.log(`Line from file: ${line}`);
        lineCounter = lineCounter + 1;
        if (line === username) {
            thename = lineCounter;
            console.log(thename);
        }
        if (line === email) {
            theemail = lineCounter;
            console.log(theemail);
            if (theemail - thename === 3) {
                flag = 1;
            }
        }
    });
    if (flag === 1) {
        lineCounter = 0;
        userInfodata.split(/\r?\n/).forEach(line => {
            var line = encryption.decrypter(line, key);
            lineCounter = lineCounter + 1;
            if (lineCounter === thename + 2) {
                password = line;
            }
            // console.log(`Line from file: ${line}`);
        });
        message = "match";
        console.log(password);
        res.json({ message, password });
    } else {
        message = "not match";
        res.json({ message });
    }


});

// feedback存放
app.post('/blockchain/feedback', (req, res) => {
    // "patient_id": 9999,
    // "doctor_id": 1200,
    // "score": 5,
    // "comment": "very good"
    const patientid = req.body.patient_id;
    const doctorid = req.body.doctor_id;
    const score = req.body.score;
    console.log(patientid);
    // const comment = req.body.comment;
    blockchain.mineToAddComment(doctorid, patientid, score);
    var message = 'success';
    res.json({ message });
    const fs3 = require('fs');
    const filePath = 'status_code.txt';
    fs3.writeFile(filePath, '0' + "\n", { flag: "a" }, (err) => {
        if (err) {
            console.error('Error', err);
        }
    })
});

// 返回所有给过doctor feedback的patient的ID
app.post('/blockchain/feedback/list', (req, res) => {
    // "doctor_id": 1200,

    const doctorid = req.body.id.toString();
    // console.log(patientid);
    // const comment = req.body.comment;
    var num = 0;
    var thepatientlist = [];
    var patientlist = [];
    let lineCounter = 0;

    const fs = require('fs');
    const doctorFeedback = fs.readFileSync('doctorFeedback.txt', 'utf-8');
    doctorFeedback.split(/\r?\n/).forEach(line => {
        // console.log("test");
        var line = encryption.decrypter(line, key);
        console.log(`Line from file: ${line}`);
        lineCounter = lineCounter + 1;
        if (line === doctorid && lineCounter % 3 === 1) {
            thepatientlist[num] = lineCounter;
            num = num + 1;
            console.log(thepatientlist);
        }
    });

    lineCounter = 0;
    num = 0;
    doctorFeedback.split(/\r?\n/).forEach(line => {
        // console.log("test");
        var line = encryption.decrypter(line, key);
        console.log(`Line from file: ${line}`);
        lineCounter = lineCounter + 1;
        if (lineCounter === thepatientlist[num] + 1) {
            patientlist[num] = line;
            num = num + 1;
            console.log("thepatientlist");
            console.log(thepatientlist);
        }
    });

    var statuscode = [];
    for (let x = 0; x < thepatientlist.length; x++) {
        statuscode[x] = (thepatientlist[x] - 1) / 3;
    }
    console.log("statuscode");
    console.log(statuscode);
    patientArray = new Array();
    // console.log("num");
    // console.log(num);
    for (let i = 0; i <= num - 1; i++) {
        let nameCounter = 0;
        var thename = 0;
        var name = '';

        const fs = require('fs');
        const userInfodata = fs.readFileSync('userInfodata.txt', 'utf-8');
        userInfodata.split(/\r?\n/).forEach(line => {
            // console.log("test");
            var line = encryption.decrypter(line, key);
            console.log(`Line from file: ${line}`);
            nameCounter = nameCounter + 1;
            if (line === patientlist[i]) {
                thename = nameCounter;
                console.log(line);
                console.log(thename);
            }
            if (nameCounter === thename + 2) {
                name = line;
                console.log(thename);
                console.log(name);
            }
        });

        lineCounter = 0;
        const fs2 = require('fs');
        const status_code = fs2.readFileSync('status_code.txt', 'utf-8');
        status_code.split(/\r?\n/).forEach(line => {
            if (lineCounter === statuscode[i] && line === "0") {
                var temp = {
                    "name": name,
                    "id": Number(patientlist[i])
                }
                patientArray.push(temp);
            }
            lineCounter = lineCounter + 1;
        });
    }

    var message = 'success';
    res.json({ message, patientArray });
});


// 返回feedback
app.post('/blockchain/feedback/approve', (req, res) => {
    // "doctor_id": 1200,



    const doctorid = req.body.doctor_id.toString();
    const patientid = req.body.patient_id.toString();
    // console.log(patientid);
    // const comment = req.body.comment;
    var num = 0;
    var num_patient = 0;
    var thedoctorlist = [];
    var statuscode = [];
    var scorelist = [];
    var scorenum = [];
    let lineCounter = 0;

    const fs = require('fs');
    const doctorFeedback = fs.readFileSync('doctorFeedback.txt', 'utf-8');
    doctorFeedback.split(/\r?\n/).forEach(line => {
        var line = encryption.decrypter(line, key);
        // console.log("test");
        // console.log(`Line from file: ${line}`);
        lineCounter = lineCounter + 1;
        if (line === doctorid && lineCounter % 3 === 1) {
            thedoctorlist[num] = lineCounter;
            num = num + 1;
            console.log(thedoctorlist);
        }
    });
    var numcode = 0;
    var codechange = [];
    for (let i = 0; i < num; i++) {
        lineCounter = 0;
        doctorFeedback.split(/\r?\n/).forEach(line => {
            var line = encryption.decrypter(line, key);
            // console.log("test");
            // console.log(`Line from file: ${line}`);
            lineCounter = lineCounter + 1;
            if (lineCounter === thedoctorlist[i] + 1) {
                if (line === patientid) {
                    var realline = (lineCounter + 1) / 3 - 1;
                    codechange[numcode] = realline;
                    numcode = numcode + 1;
                    console.log("codechange:");
                    console.log(codechange);
                }
            }
        });
    }
    lineCounter = 0;
    const fs2 = require('fs');
    const status_code = fs2.readFileSync('status_code.txt', 'utf-8');
    status_code.split(/\r?\n/).forEach(line => {
        // console.log("test");
        // console.log(`Line from file: ${line}`);
        statuscode[lineCounter] = Number(line);
        lineCounter = lineCounter + 1;
    });
    statuscode.pop();
    console.log("statuscode:");
    console.log(statuscode);
    var number = 0;
    for (let i = 0; i < statuscode.length; i++) {
        if (i === codechange[number]) {
            statuscode[i] = 1;
            number = number + 1;
            console.log(statuscode);
        }
    }
    console.log("newstatuscode:");
    console.log(statuscode);
    var temp = "";
    for (let i = 0; i < statuscode.length; i++) {
        temp = temp + statuscode[i] + "";
        temp = temp + '\n';
    }
    const fs3 = require('fs');
    const filePath = 'status_code.txt';
    patientorder = patientorder + 1;
    fs3.writeFile(filePath, temp, (err) => {
        if (err) {
            console.error('Error', err);
        }
    })


    lineCounter = 0;
    num = 0;
    doctorFeedback.split(/\r?\n/).forEach(line => {
        // console.log("test");
        // console.log(`Line from file: ${line}`);
        var line = encryption.decrypter(line, key);
        lineCounter = lineCounter + 1;
        if (lineCounter === thedoctorlist[num] + 2) {
            scorenum[num] = lineCounter / 3 - 1;
            scorelist[num] = line;
            num = num + 1;
            // console.log(thedoctorlist);
        }
    });
    console.log(scorelist);
    console.log("scorenum");
    console.log(scorenum);
    var score;
    var sum = 0;
    num = 0;
    for (let i = 0; i < scorenum.length; i++) {
        if (statuscode[scorenum[i]] === 1) {
            console.log(scorelist[i]);
            num++;
            sum = sum + Number(scorelist[i]);
        }

        // console.log(Number(patientlist[i]));
    }
    score = sum / num;

    var message = 'success';
    res.json({ message, score });
});

// 去中心化对比是否正确
app.post('/blockchain/check1', (req, res) => {
    // "doctor_id": 1200,
    const doctorid = req.body.doctor_id.toString();
    // console.log(patientid);
    // const comment = req.body.comment;
    var num = 0;
    var thepatientlist = [];
    var patientlist = [];
    let lineCounter = 0;

    const fs = require('fs');
    const doctorFeedback = fs.readFileSync('doctorFeedback.txt', 'utf-8');
    doctorFeedback.split(/\r?\n/).forEach(line => {
        var line = encryption.decrypter(line, key);
        // console.log("test");
        console.log(`Line from file: ${line}`);
        lineCounter = lineCounter + 1;
        if (line === doctorid) {
            thepatientlist[num] = lineCounter;
            num = num + 1;
            console.log(thepatientlist);
        }
    });

    lineCounter = 0;
    num = 0;
    doctorFeedback.split(/\r?\n/).forEach(line => {
        var line = encryption.decrypter(line, key);
        // console.log("test");
        console.log(`Line from file: ${line}`);
        lineCounter = lineCounter + 1;
        if (lineCounter === thepatientlist[num] + 1) {
            patientlist[num] = line;
            num = num + 1;
            console.log(thepatientlist);
        }
    });
    console.log(patientlist);
    var score;
    var sum = 0;
    for (let i = 0; i < num; i++) {
        sum = sum + Number(patientlist[i]);
        // console.log(Number(patientlist[i]));
    }
    score = sum / num;

    var message = 'success';
    res.json({ message, score });
});




app.listen(port, () => {
    console.log(`API listening at http://localhost:${port}`);
});