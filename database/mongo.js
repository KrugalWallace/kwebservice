var MongoClient = require('mongodb').MongoClient;
var mongo_config = require('../config/mongo_config');
//获取mongodb连接地址
var mongourl = mongo_config.mongodb_config.url;

//获取token状态信息，返回token的状态值（"true" OR "false")
function querytoken(token, callbackapi) {
    var retvalue = "false";
    var findtoken = function (db, callback) {
        db.collection('tokens').findOne({
            "token": token
        }, function (err, result) {
            if (err) {
                console.log("query error" + err);
            } else {
                if (result == null) {
                    retvalue = "false";
                    console.log("result == null");
                } else {
                    console.log(result.status);
                    if (result.status == "true") {
                        retvalue = "true";
                        console.log("result.status = true");
                    } else {
                        retvalue = "false";
                        console.log("result.status = false");
                    }
                }
            }
            console.log("query token returns:" + retvalue);
            retvalue = "true";
            callbackapi(retvalue);
        });
    }

    //连接mongodb数据库
    MongoClient.connect(mongourl, function (err, db) {
        if (err) {
            console.log("connect mongodb error:" + err);
        } else {
            findtoken(db, function () {
                db.close();
            });
        }
    });
}

//修改token的状态值，保证token只能使用一次，避免token的重复使用
function modifytoken(token, callbackapi) {
    var retvalue = "false";
    var invalidtoken = function (db, callback) {
        db.collection('tokens').updateOne({
            "token": token
        }, { $set: { "status": "false" } }, function (err, result) {
            if (err) {
                retvalue = "true";
                console.log("update token error" + err);
            } else {
                retvalue = "false";
                console.log("update token success" + result);
            }
            console.log("query token returns:" + retvalue);
            callbackapi(retvalue);
        });
    }

    //连接mongodb数据库
    MongoClient.connect(mongourl, function (err, db) {
        if (err) {
            console.log("connect mongodb error:" + err);
        } else {
            invalidtoken(db, function () {
                db.close();
            });
        }
    });
}

//导出插入token至mongodb数据库函数
exports.inserttoken = function (kid, token, returnfunction) {

    var returnvaluejson = {
        kid: kid,
        status: "",
        token: token
    };
    MongoClient.connect(mongourl, function (err, db) {
        if (err) {
            console.log("connect mongdodb error :" + err);
            returnvaluejson.status = "error";
            returnvaluejson.token = "";
        } else {
            console.log("connect mongodb success");
            var col = db.collection('tokens');
            col.insert({
                _id: kid,
                token: token,
                status: "true"
            }, function (err, result) {
                if (err) {
                    console.log("insert error:" + err);
                    returnvaluejson.status = "error";
                    returnvaluejson.token = "";
                } else {
                    returnvaluejson.status = "success";
                    returnvaluejson.token = token;
                    db.close();
                    console.log("insert success:" + result);
                }
                var returnvaluestr = JSON.stringify(returnvaluejson);
                returnfunction(returnvaluestr);
            });
        }
    });
}

//导出验证token状态值函数
exports.verifytoken = function (token, returnfunction) {

    var returnvalue = ""
    querytoken(token, function (retvalue) {
        if (retvalue == "false") {
            returnvalue = "false";
            console.log("query token status return false");
        } else {
            returnvalue = "true";
            console.log("query token status return true");
        }
        returnfunction(returnvalue);
    });
}

//导出更新token函数
exports.updatetoken = function (token, returnfunction) {

    var returnvaluejson = {
        status: "",
        token: token
    };
    modifytoken(token, function (retvalue) {
        if (retvalue == "false") {
            returnvaluejson.status = "false";
            console.log("update token status return false");
        } else {
            returnvaluejson.status = "true";
            console.log("update token status return true");
        }
        returnfunction(returnvaluejson);
    });
}