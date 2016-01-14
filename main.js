var request = require('superagent');
var cheerio = require('cheerio');
var fs = require("fs");
var Q = require("q");

/**
 * 根据错误代码返回对应的错误对象
 * @param errCode 错误代码
 * @returns {{errCode: *, errMsg: (*|string)}}
 * @constructor
 */
function ErrObj(errCode) {
    var data = {
        "1001": "缺少参数，请输入频道代码",
        "1002": "频道不存在",
        "1003": "请求节目预告信息出错",
        "1004": "请求太频繁，已被禁止访问, 请稍后再试",
        "1005": "获取查询的token出错",
        "2001": "不可预知的异常"
    };
    return {
        errCode: errCode,
        errMsg: data[errCode] || "未知错误"
    }
}

process.on('uncaughtException', function () {
    console.log(JSON.stringify(new ErrObj(2001)));
});

var ua = 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36';

/**
 * 第一步，获取查询相关的加密参数, resolve一个url，访问该url可以获得节目预告信息
 * @param channelCode 频道代码
 * @param week
 * @returns {*|r.promise|Function|promise}
 */
function getSpotsUrl(channelCode, week) {
    var defer = Q.defer();
    request.get('http://m.tvmao.com/program/' + channelCode + '-w' + week + '.html')
        .set('User-Agent', ua)
        .end(function (err, res) {
            if(err){
                switch(err.status){
                    case 403: defer.reject(1004); break;
                    case 404: defer.reject(1002); break;
                    default: defer.reject(1005); break;
                }
            } else if(res.statusCode != 200) {
                defer.reject(9999);
                return;
            } else {
                var $ = cheerio.load(res.text);
                var form = $("[name=frmq]");
                var q = form.attr("q");
                var a = form.attr("a");
                var id = form.find("[type=submit]").attr("id");
                var str1 = new Buffer(id + "|" + a).toString('base64');
                var str2 = new Buffer("|" + q).toString('base64');
                var queryStr = str1 + str2;
                var url = "http://m.tvmao.com/api/pg?p=Q" + encodeURIComponent(queryStr);
                defer.resolve(url);
            }
        });
    return defer.promise;
}

/**
 * 第二步，解析结果并返回
 * @param url
 * @returns {*|r.promise|Function|promise}
 */
function getSpotInfo(url) {
    var defer = Q.defer();
    request.get(url)
        .set('User-Agent', ua)
        .end(function (err, res) {
            if (err){
                if(err.status == 403){
                    defer.reject(1004);
                } else {
                    defer.reject(1003);
                }
            } else if(res.statusCode != 200) {
                defer.reject(1003);
            } else {
                var obj = JSON.parse(res.text);
                var $ = cheerio.load(obj[1]);
                var result = [];
                var trs = $("tr");
                trs.each(function (index) {
                    var info = trs.eq(index).text();
                    var time = info.substring(0, 5);
                    var playName = info.substring(5);
                    result.push({
                        time: time,
                        playName: playName
                    });
                });
                defer.resolve(result);
            }
        });
    return defer.promise;
}

/**
 * 程序主方法
 */
function main() {
    var args = process.argv.splice(2);
    if (args.length === 0) {
        console.log(JSON.stringify(new ErrObj(1001)));
        return;
    }
    getSpotsUrl(args[0].toUpperCase(), args[1] || (new Date().getDay())).then(function (url) {
        return getSpotInfo(url);
    }).then(function (spotsInfo) {
        console.log(JSON.stringify(spotsInfo));
    }).catch(function(errCode){
        console.log(JSON.stringify(new ErrObj(errCode)));
    });
}

main();