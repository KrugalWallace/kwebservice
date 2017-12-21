var crypto = require('crypto');
var urlencode = require('urlencode');
var web3_config = require('../config/web3_config');
var kcrypto = require('../crypto/crypto');
var ktoken = require('../token/token');
var kfile = require('../file/file');
var kreturn = require('../return/return');
var BigNumber = require('bignumber.js');
var account_config = require('../config/account_config');
var token_config = require('../config/token_config');
var contract_config = require('../config/contract_config');
var fs = require('fs');

//加密函数实现
function encrypto(req, res, next) {

    var enkey = req.params.key;
    var key = urlencode.decode(enkey);
    kcrypto.encrypt(key, function (ciphertext) {
        kreturn.returndata(res, ciphertext);
    });

}

//解密函数实现
function decrypto(req, res, next) {

    var enkey = req.params.key;
    var key = urlencode.decode(enkey);
    kcrypto.decrypt(key, function (plaintext) {
        kreturn.returndata(res, plaintext);
    });

}

//获取token
function gettoken(req, res, next) {

    var enreqciphertext = req.params.key;
    var reqciphertext = urlencode.decode(enreqciphertext);

    try {
        kcrypto.decrypt(reqciphertext, function (plaintext) {
            try {
                var plainjson = JSON.parse(plaintext);
                var transid = plainjson.transid;
                ktoken.generatetoken(transid, function (returnvalue) {
                    try {
                        returnvaluejson = JSON.parse(returnvalue);
                        var token = returnvaluejson.token;
                        var status = returnvaluejson.status;
                        console.log(status);
                        if (status == "error") {
                            kreturn.returnerror(res);
                        } else {
                            var resplainjson = {
                                transid: transid,
                                token: token
                            };
                            resplaintext = JSON.stringify(resplainjson);
                            kcrypto.encrypt(resplaintext, function (resciphertext) {
                                kreturn.returndata(res, resciphertext);
                            });
                        }
                    } catch (e) {

                    }

                });

            } catch (e) {
                console.log("json parse return error:" + e);
                kreturn.returnerror(res);
            }
        });
    } catch (e) {
        console.log("decryption error:" + e);
        kreturn.returnerror(res);
    }

}

//验证token有效性
function verifytoken(req, res, next) {
    var enkey = req.params.key;
    var key = urlencode.decode(enkey);
    ktoken.verifytoken(key, function (returnvalue) {
        res.json({
            token: returnvalue.token,
            status: returnvalue.status
        });
    });
}

//更新token状态值，使得token只能使用一次
function updatetoken(req, res, next) {
    var enkey = req.params.key;
    var key = urlencode.decode(enkey);
    ktoken.updatetoken(key, function (returnvalue) {
        res.json({
            token: returnvalue.token,
            status: returnvalue.status
        });
    });
}


//根据地址信息获取该地址所拥有的ETH数量（单位为wei)
function getbalances(req, res, next) {

    var enreqciphertext = req.params.key;
    var reqciphertext = urlencode.decode(enreqciphertext);
    var untoken = "";
    try {
        kcrypto.decrypt(reqciphertext, function (plaintext) {
            try {
                var plainjson = JSON.parse(plaintext);
                var address = plainjson.address;
                var token = plainjson.token;
                untoken = token;
                ktoken.verifytoken(token, function (returnvalue) {
                    if (returnvalue == "false") {
                        console.log("verify token return false");
                        kreturn.returnerror(res);
                    } else {
                        web3_config.initipcweb3(function (web3) {
                            console.log(web3.utils);
                            var abi = contract_config.abi;
                            var contractaddress = contract_config.address;
                            var mycontract = new web3.eth.Contract(abi, contractaddress);
                            console.log("balance of address:" + address);
                            mycontract.methods.balanceOf(address).call(function (err, result) {
                                if (err) {
                                    console.log(err);
                                    kreturn.returnerror(res);
                                } else {
                                    console.log(result);
                                    kreturn.returndata(res, result);
                                }
                            });
                        });
                    }
                });
            } catch (e) {
                console.log(e);
                kreturn.returnerror(res);
            }
        });
    } catch (e) {
        console.log(e);
        kreturn.returnerror(res);
    }
}

//根据交易的哈希值获取包含该交易哈希的区块信息
function gettransactions(req, res, next) {

    var enreqciphertext = req.params.key;
    var reqciphertext = urlencode.decode(enreqciphertext);
    var untoken = "";
    try {
        kcrypto.decrypt(reqciphertext, function (plaintext) {
            try {
                var plainjson = JSON.parse(plaintext);
                var hashvalue = plainjson.hashvalue;
                var token = plainjson.token;
                untoken = token;
                ktoken.verifytoken(token, function (returnvalue) {
                    if (returnvalue == "false") {
                        console.log("verify token return false");
                        kreturn.returnerror(res);
                    } else {
                        web3_config.initweb3(function (web3) {
                            web3.eth.getTransaction(hashvalue, function (err, result) {
                                if (err) {
                                    console.log("gettransactions function return error :" + err);
                                    kreturn.returnerror(res);
                                } else {
                                    var resplainjson = {
                                        hashvalue: hashvalue,
                                        block: result
                                    };
                                    var resplaintext = JSON.stringify(resplainjson);
                                    kcrypto.encrypt(resplaintext, function (resciphertext) {
                                        kreturn.returndata(res, resciphertext);
                                    });

                                    ktoken.updatetoken(untoken, function (returnvalue) {
                                        if (returnvalue == "false") {
                                            console.log("update token failure");
                                        } else {
                                            console.log("update token success");
                                        }
                                    });
                                }
                            });
                        });
                    }
                });
            } catch (e) {
                console.log("json parse return error:" + e);
                kreturn.returnerror(res);
            }
        });
    } catch (e) {
        console.log("decryption error:" + e);
        kreturn.returnerror(res);
    }
}


//智能合约操作（通过智能合约的函数实现ERC20代币的转帐）
function docontract(req, res, next) {
    var abi = contract_config.abi;
    var address = contract_config.address;

    web3_config.initweb3(function (web3) {
        var mycontract = new web3.eth.Contract(abi, address);
        var transfer = mycontract.methods.transfer("0x7857038BD7F073de7D32884890F80C5DF237CFD2", 10);
        var encodeABI = transfer.encodeABI();
        var tx = {
            from: "0xfc65763e3b422a3e6953b8a329e2bdd08ea9bac0",
            to: address,
            gas: 2100000,
            data: encodeABI
        };

        var fromaddress = "fc65763e3b422a3e6953b8a329e2bdd08ea9bac0";
        kfile.getprivatekey(fromaddress, function (privatekey) {
            console.log("sign private key:" + privatekey);
            web3.eth.accounts.signTransaction(tx, privatekey).then(signed => {
                var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);

                tran.on('transactionHash', hash => {
                    console.log("transaction hash is :" + hash);
                    kreturn.returndata(res, hash);
                });

                tran.on('error', err => {
                    console.log("sign transaction error" + err);
                    kreturn.returnerror(res);
                });
            });
        });
    });


}

//获得当前节点所拥有的所有地址信息列表
function getallaccounts(req, res, next) {

    var enreqciphertext = req.params.key;
    var reqciphertext = urlencode.decode(enreqciphertext);
    var untoken = "";
    try {
        kcrypto.decrypt(reqciphertext, function (plaintext) {
            try {
                var plainjson = JSON.parse(plaintext);
                var token = plainjson.token;
                untoken = token;
                ktoken.verifytoken(token, function (returnvalue) {
                    if (returnvalue == "false") {
                        console.log("verify token return false");
                        kreturn.returnerror(res);
                    } else {
                        web3_config.initweb3(function (web3) {
                            console.log(web3);
                            web3.eth.getAccounts(function (err, result) {
                                if (err) {
                                    console.log("getaccounts function return error:" + err);
                                    kreturn.returnerror(res);
                                } else {
                                    var resplainjson = {
                                        list: result
                                    };
                                    var resplaintext = JSON.stringify(resplainjson);
                                    kcrypto.encrypt(resplaintext, function (resciphertext) {
                                        kreturn.returndata(res, resciphertext);
                                    });

                                    ktoken.updatetoken(untoken, function (returnvalue) {
                                        if (returnvalue == "false") {
                                            console.log("update token failure");
                                        } else {
                                            console.log("update token success");
                                        }
                                    });
                                }
                            });
                        });
                    }
                });
            }
            catch (e) {
                console.log("json parse return error:" + e);
                kreturn.returnerror(res);
            }
        });
    }
    catch (e) {
        console.log("decryption error:" + e);
        kreturn.returnerror(res);
    }
}



module.exports = {
    encrypto: encrypto,
    decrypto: decrypto,
    gettoken: gettoken,
    verifytoken: verifytoken,
    updatetoken: updatetoken,
    getbalances: getbalances,
    gettransactions: gettransactions,
    getcurrentblockindex: getcurrentblockindex,
    getblockdetail: getblockdetail,
    getallaccounts: getallaccounts,
    docontract: docontract
};


