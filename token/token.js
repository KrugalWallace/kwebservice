var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var token_config = require('../config/token_config');
var kmongo = require('../database/mongo');

//生成token信息
exports.generatetoken = function (kid, returnfunction) {

    //token生成过程加入随机数信息
    var randomtext1 = crypto.randomBytes(16);
    var randomtext2 = crypto.randomBytes(16);
    var secret = token_config.token_config.secret;
    jwt.sign(randomtext1 + kid + randomtext2, secret, function (err, token) {
        if (err) {
            console.log("generate token return error: " + err);
            returnvaluejson.status = "error";
            returnvaluejson.token = "";
        } else {
            console.log("insert mongodb begin");
            kmongo.inserttoken(kid, token, function (returnvalue) {
                returnfunction(returnvalue);
            });
        }

    });
}

//验证token有效性
exports.verifytoken = function (token, returnfunction) {
    kmongo.verifytoken(token, function (returnvaluejson) {
        returnfunction(returnvaluejson);
    });
}

//更新token状态信息
exports.updatetoken = function (token, returnfunction) {
    kmongo.updatetoken(token, function (returnvaluejson) {
        returnfunction(returnvaluejson);
    });
}