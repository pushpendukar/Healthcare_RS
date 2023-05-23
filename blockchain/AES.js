// 导入crypto-js模块
var CryptoJS = require("crypto-js");

// 定义密钥
var key = 'esage';

// 加密函数
class Encryption {
    encrypter(str, secret) {
        return CryptoJS.AES.encrypt(str.toString(), secret).toString();
    }

    // 解密函数
    decrypter(str, secret) {
        var bytes = CryptoJS.AES.decrypt(str.toString(), secret);
        return bytes.toString(CryptoJS.enc.Utf8);
    }
}

var encryption = new Encryption();

// 加密字符串并输出结果
var encrypted = encryption.encrypter("Hello World!", key);
console.log("加密后的内容：" + encrypted);

// 解密字符串并输出结果
var decrypted = encryption.decrypter(encrypted, key);
console.log("解密后的内容：" + decrypted);

module.exports = Encryption;