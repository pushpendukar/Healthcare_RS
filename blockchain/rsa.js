// 非对称加密
let fs = require('fs')
let EC = require('elliptic').ec
let ec = new EC('secp256k1')
let keypair = ec.genKeyPair()

function getPub(prv) {
    // 根据私钥算出公钥
    return ec.keyFromPrivate(prv).getPublic('hex').toString
}

const keys = generateKeys()
// console.log(res)

function generateKeys() {
    const fileName = './wallet.json'
    try {
        let res = JSON.parse(fs.readFileSync(fileName))
        if (res.prv && res.pub && getPub(res.prv) == res.pub) {
            keypair = ec.keyFromPrivate(res.prv)
            return res
        } else {
            //验证失败
            throw 'not vaild wallet.json'
        }
    } catch (error) {
        // 文件不存在或不合法
        const res = {
            // 私钥
            prv: keypair.getPrivate('hex').toString(),
            // 公钥
            pub: keypair.getPublic('hex').toString()
        }
        fs.writeFileSync(fileName, JSON.stringify(res))
        return res
    }

}
// console.log(res)

// 签名
function sign({ from, to, amount }) {
    const bufferMsg = Buffer.from(`${from}-${to}-${amount}`)
    let signature = Buffer.from(keypair.sign(bufferMsg).toDER()).toString('hex')
    return signature
}

//校验签名
function verify({ from, to, amount, signature }, pub) {
    // 只用私钥
    const keypairTemp = ec.keyFromPublic(pub, 'hex')
    const bufferMsg = Buffer.from(`${from}-${to}-${amount}`)
    return keypairTemp.verify(bufferMsg, signature)
}
const trans = { from: 'zhu', to: 'www', amount: 100 }
const trans1 = { from: 'zhu', to: 'www', amount: 100 }
const signature = sign(trans)
trans.signature = signature
console.log(signature)
const isVerify = verify(trans, keys.pub)
console.log(isVerify)