var fs = require('fs');
var account_config = require('../config/account_config');
var web3_config = require('../config/web3_config');

//通过口令信息获取相应地址的私钥信息用来签名交易信息，并导出
exports.getprivatekey = function (fromaddress, returnfunction) {
    var privatekey = "";
    var keypath = account_config.accounts_config.keypath;
    var password = account_config.accounts_config.password;
    fs.readdir(keypath, function (err, result) {
        if (err) {
            console.log(err);
            returnfunction("");
        } else {
            console.log(result.length);
            for (var i = 0; i < result.length; ++i) {
                if (result[i].toString().indexOf(fromaddress) > -1) {
                    console.log(result[i]);

                    fs.readFile(keypath + result[i], function (err, filedata) {
                        if (err) {
                            console.log("readfile error" + err);
                            returnfunction("");
                        } else {
                            console.log(filedata.toString());
                            web3_config.initipcweb3(function (web3) {
                                var privatekeydata = web3.eth.accounts.decrypt(filedata.toString(), password);
                                privatekey = privatekeydata.privateKey;
                                console.log("privatekey:" + privatekey);
                                returnfunction(privatekey);
                            });
                        }
                    });
                }
            }
        }
    });

}