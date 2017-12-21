var Web3 = require('web3');
var net = require('net');

//配置连接web3时的httpprovider信息
var httpprovier = "http://localhost:8545";
//IPC文件的绝对路径
var ipcpath = '/home/krugal/.ethereum/testnet/geth.ipc';


//支持ＲＰＣ请求时初始化web3变量
exports.initweb3 = function (returnfunction) {

  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
  } else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider(httpprovier));
  }
  returnfunction(web3);
}


//当有些函数不支持通过RPC方式请求时，通过IPC方式初始化web3变量
exports.initipcweb3 = function (returnfunction) {

  var web3 = new Web3(ipcpath, net);
  returnfunction(web3);
}

