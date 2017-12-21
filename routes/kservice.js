var express = require("express");

var kweb3 = require('../web3/web3');



var router = express.Router();

//webservice:加密服务
router.route('/crypto/:key')

    .post(function (req, res, next) {
        kweb3.encrypto(req, res, next);
    })
//webservice:解密服务
router.route('/decrypto/:key')

    .post(function (req, res, next) {
        kweb3.decrypto(req, res, next);
    })
//webservice:获取token
router.route('/gettoken/:key')

    .post(function (req, res, next) {
        kweb3.gettoken(req, res, next);
    })

//webservice:申请新的以太坊地址
router.route('/applyaddress/:key')

    .post(function (req, res, next) {
        kweb3.applyaddress(req, res, next);
    })

//webservice:根据地址查询该地址所拥有的ETH数量（单位为wei)
router.route('/getbalances/:key')

    .post(function (req, res, next) {
        kweb3.getbalances(req, res, next);
    })
//webservice:根据交易的哈希值获取包含该哈希值的区块信息
router.route('/gettransactions/:key')

    .post(function (req, res, next) {
        kweb3.gettransactions(req, res, next);
    })

//webservice:获得当前节点所拥有的所有以太坊地址信息
router.route('/getallaccounts/:key')

    .post(function (req, res, next) {
        kweb3.getallaccounts(req, res, next);
    })

//webservice:智能合约操作（实现转ERC20代币功能)
router.route('/docontract/:key')

    .post(function (req, res, next) {
        kweb3.initcontract(req, res, next);
    })

module.exports = router;