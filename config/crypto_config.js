//加密对应的配置信息
var crypto_config = {
    //加密使用的口令
    "secret": "password",
    //明文对应的编码格式
    "plainEncoding": "utf8",
    //密文对应的编码格式
    "cipherEncoding": "hex",
    //AES加密模式
    "aesmode": "aes-128-ecb"
};

module.exports = {
    crypto_config: crypto_config
};