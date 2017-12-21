//当函数执行失败时返回错误信息
exports.returnerror = function (res) {
    res.json({
        status: "error",
        data: ""
    });
}
//当函数执行成功时返回相应数据信息
exports.returndata = function (res, data) {
    res.json({
        status: "success",
        data: data
    });
}