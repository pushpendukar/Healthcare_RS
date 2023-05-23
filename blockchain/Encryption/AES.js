// 导入crypto-js模块
var CryptoJS = require("crypto-js");

// 定义密钥
var key = 'esage';

// 加密函数
function encrypter(str, secret) {
    return CryptoJS.AES.encrypt(str.toString(), secret).toString();
}

// 解密函数
function decrypter(str, secret) {
    var bytes = CryptoJS.AES.decrypt(str.toString(), secret);
    return bytes.toString(CryptoJS.enc.Utf8);
}

// 加密字符串并输出结果
var encrypted = encrypter("Hello World!", key);
console.log("加密后的内容：" + encrypted);

// 解密字符串并输出结果
var decrypted = decrypter(encrypted, key);
console.log("解密后的内容：" + decrypted);