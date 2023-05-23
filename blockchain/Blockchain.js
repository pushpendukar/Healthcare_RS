
// 提供加解密函数
const crypto = require('crypto')
const Encryption = require('./AES')
const encryption = new Encryption()
var key = "test";

// 创世区块
const initBlock = {
    index: 0,
    data: 'hello Newchain',
    prevHash: '0',
    timestamp: 1677732866476,
    nonce: 133345,
    hash: '0000cc508de7c2e3c26b5c2b8dbb45fa5809f1f6510ae1f4a019df9aa78d0cfb'
}

class Blockchain {
    constructor() {
        this.blockchain = [initBlock]
        this.data = []

        this.difficulty = 4
        // 创世区块
        // const hash = this.computeHash(0, '0', new Date().getTime(), 'hello Newchain', 1)
        // console.log(hash)
    }

    getLastBlock() {
        return this.blockchain[this.blockchain.length - 1]
    }
    // 为data添加信息
    addUserInfo(id, username, name, password, email) {
        // 签名
        // if (from !== '0') {
        //     const blance = this.blance(from)
        //     if (blance < amount) {
        //         console.log('钱不够哇')
        //         return
        //     }
        // }
        const transnObj = { id, username, name, password, email }
        this.data.push(transnObj)
        return transnObj
    }

    addUserComment(patientid, doctorid, score) {
        const transnObj = { patientid, doctorid, score }
        this.data.push(transnObj)
        return transnObj
    }

    // 查看信息
    // 2种信息 账号 密码 邮箱
    // 用户评论
    // blance(address) {
    //     let blance = 0
    //     this.blockchain.forEach(block => {
    //         if (!Array.isArray(block.data)) {
    //             // 创世区块
    //             return
    //         }
    //         block.data.forEach(trans => {
    //             // 转出
    //             if (address == trans.from) {
    //                 blance -= trans.amount
    //             }
    //             // 转入
    //             if (address == trans.to) {
    //                 blance += trans.amount
    //             }
    //         })
    //     })
    //     return blance
    // }

    // 挖矿
    mineToAddInfo(id, username, name, password, email) {
        // 生成新区块 将新的加入区块
        // 不停计算哈希 直到获得符合条件哈希值

        // 挖矿成功给100
        this.addUserInfo(id, username, name, password, email)

        const newBlock = this.generateNewBlock()

        // 区块合法 并且区块链合法 就新增
        if (this.isValidBlock(newBlock) && this.isValidChain(this.blockchain)) {
            this.blockchain.push(newBlock)
            this.data = []
            var fs = require("fs");
            // fs.writeFile("userInfodata.txt", JSON.stringify(newBlock.index) + "\r", { flag: "a" }, function (err) {
            //     if (!err) {
            //         console.log("写入成功！");
            //     }
            // });
            console.log(newBlock.data[0].id);
            // console.log(encryption.encrypter(doctororder.toString(), key));
            // fs.writeFile("userInfodatatest.txt", newBlock.data[0].id + "\n" + newBlock.data[0].username + "\n" + newBlock.data[0].name + "\n" + newBlock.data[0].password + "\n" + newBlock.data[0].email + "\n", { flag: "a" }, function (err) {
            //     if (!err) {
            //         console.log("写入成功！");
            //     }
            // });
            fs.writeFile("userInfodata.txt", encryption.encrypter(newBlock.data[0].id, key) + "\n" + encryption.encrypter(newBlock.data[0].username, key) + "\n" + encryption.encrypter(newBlock.data[0].name, key) + "\n" + encryption.encrypter(newBlock.data[0].password, key) + "\n" + encryption.encrypter(newBlock.data[0].email, key) + "\n", { flag: "a" }, function (err) {
                if (!err) {
                    console.log("写入成功！");
                }
            });
            return newBlock
        } else {
            console.log('error!,invalid block')
            // console.log(newBlock)
        }



        // let nonce = 0
        // //  mine是挖矿产生新的区块 所以index即为length
        // const index = 0
        // const data = 'first'
        // // 上一个区块的hash值放到这个区块中
        // const prevHash = '0'
        // let timestamp = 1677732866476
        // let hash = this.computeHash(index, prevHash, timestamp, data, nonce)
        // // hash值切片 0-2 判断前两位是否为‘00’ 挖矿的本质
        // // while (hash.slice(0, 2) !== '00') {
        // while (hash.slice(0, this.difficulty) !== '0'.repeat(this.difficulty)) {
        //     nonce += 1
        //     hash = this.computeHash(index, prevHash, timestamp, data, nonce)
        // }
        // console.log({
        //     hash
        // })
    }

    mineToAddComment(patientid, doctorid, score) {

        this.addUserComment(patientid, doctorid, score)

        const newBlock = this.generateNewBlock()

        // 区块合法 并且区块链合法 就新增
        if (this.isValidBlock(newBlock) && this.isValidChain(this.blockchain)) {
            this.blockchain.push(newBlock)
            this.data = []
            var fs = require("fs");
            // fs.writeFile("doctorFeedbacktest.txt", newBlock.data[0].patientid + "\n" + newBlock.data[0].doctorid + "\n" + newBlock.data[0].score + "\n", { flag: "a" }, function (err) {
            //     if (!err) {
            //         console.log("写入成功！");
            //     }
            // });
            fs.writeFile("doctorFeedback.txt", encryption.encrypter(newBlock.data[0].patientid, key) + "\n" + encryption.encrypter(newBlock.data[0].doctorid, key) + "\n" + encryption.encrypter(newBlock.data[0].score, key) + "\n", { flag: "a" }, function (err) {
                if (!err) {
                    console.log("写入成功！");
                }
            });
            return newBlock
        } else {
            console.log('error!,invalid block')
            // console.log(newBlock)
        }
    }

    generateNewBlock() {
        // 生成新区块
        let nonce = 0
        //  mine是挖矿产生新的区块 所以index即为length
        const index = this.blockchain.length
        const data = this.data
        // 上一个区块的hash值放到这个区块中
        const prevHash = this.getLastBlock().hash
        let timestamp = new Date().getTime()
        let hash = this.computeHash(index, prevHash, timestamp, data, nonce)
        // hash值切片 0-2 判断前两位是否为‘00’ 挖矿的本质
        // while (hash.slice(0, 2) !== '00') {
        while (hash.slice(0, this.difficulty) !== '0'.repeat(this.difficulty)) {
            nonce += 1
            hash = this.computeHash(index, prevHash, timestamp, data, nonce)
        }
        return {
            index,
            data,
            prevHash,
            timestamp,
            nonce,
            hash
        }

    }
    computeHashForBlock({ index, prevHash, timestamp, data, nonce }) {
        return this.computeHash(index, prevHash, timestamp, data, nonce)
    }
    // 计算哈希
    // index 索引 timestramp时间戳 data区块信息 hash当前区块哈希 prevhash上一个区块的哈希 nonce随机数
    computeHash(index, prevHash, timestamp, data, nonce) {
        return crypto
            .createHash('sha256')
            .update(index + prevHash + timestamp + data + nonce)
            .digest('hex')
    }
    // 校验区块
    isValidBlock(newBlock, lastBlock = this.getLastBlock()) {

        // 1 区块的index等于最新区块的index+1
        // 2 区块的time大于最新区快 因为是后生成的
        // 3 prevhash==上一个的hash
        // 4 区块的hash值符合难度要求 例如前面4个0
        // 5 hash值比较 改nonce也不行
        if (newBlock.index !== lastBlock.index + 1) {
            return false
        } else if (newBlock.timestamp <= lastBlock.timestamp) {
            return false
        } else if (newBlock.prevHash !== lastBlock.hash) {
            return false
        } else if (newBlock.hash.slice(0, this.difficulty) !== '0'.repeat(this.difficulty)) {
            return false
        } else if (newBlock.hash != this.computeHashForBlock(newBlock)) {
            return false
        }
        return true
    }

    // 校验区块链 校验老区块数据是否正确
    isValidChain(chain = this.blockchain) {
        // 校验除创世区块外的
        for (let i = chain.length - 1; i >= 1; i--) {
            if (!this.isValidBlock(chain[i], chain[i - 1])) {
                return false
            }
        }
        // 校验创世区块
        if (JSON.stringify(chain[0]) !== JSON.stringify(initBlock)) {
            return false
        }
        return true
    }

    getUserinfo(name) {
        console.log("getinfo");
    }

    getUsercomment() {
        console.log("getUsercomment");
    }
}

// 使用 输出哈希 每次都不一样
// let test = new Blockchain()
// test.mine()
// test.blockchain[1].prevHash = 22
// test.blockchain[1].nonce = 22
// test.mine()
// test.mine()
// console.log(test.blockchain)

module.exports = Blockchain
// module.exports = {
//     Blockchain,
//     mineToAddInfo
// }
