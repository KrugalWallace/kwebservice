var urlencode = require('urlencode');
var crypto = require('crypto');
var crypto_config = require("../config/crypto_config");

//获取加密配置文件中的加密配置信息
var secret = crypto_config.crypto_config.secret;
var plainEncoding = crypto_config.crypto_config.plainEncoding;
var cipherEncoding = crypto_config.crypto_config.cipherEncoding;
var aesmode = crypto_config.crypto_config.aesmode;

//加密函数实现
function encryption(plaintext, callbackapi) {

    var cipher = crypto.createCipher(aesmode, secret);
    let ciphertext = cipher.update(plaintext.toString(), plainEncoding, cipherEncoding);
    ciphertext += cipher.final(cipherEncoding);
    callbackapi(ciphertext);
}

//解密函数实现
function decryption(ciphertext, callbackapi) {

    var decipher = crypto.createDecipher(aesmode, secret);
    let plaintext = decipher.update(ciphertext.toString(), cipherEncoding, plainEncoding);
    plaintext += decipher.final(plainEncoding);
    callbackapi(plaintext);

}

//导出加密函数
exports.encrypt = function (plaintext, returnfunction) {
    encryption(plaintext, function (ciphertext) {
        returnfunction(ciphertext);
    });
}

//导出解密函数
exports.decrypt = function (ciphertext, returnfunction) {
    decryption(ciphertext, function (plaintext) {
        returnfunction(plaintext);
    });
}

