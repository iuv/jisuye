//全局变量
var links = {};
var allLinkData = [];//所有收藏的链接
var linksKeys = ',';// key集合以英文逗号分隔，用以判断有多少个
var SP_KEY = "G"; //特殊键
var KEYS = "VAE" + SP_KEY;//所有有效的快捷键
var timeClear;
var it = "";
var oldTipId;
var msgOutTime = 1500;// msg显示失效时间（毫秒）

//阻止空格下滑
document.onkeydown = function(event) {
    if (event.target.nodeName == 'TEXTAREA' || event.target.nodeName == 'INPUT') {
        return;
    };
    if (event.keyCode == 32) {
        event.preventDefault();
    };
}
document.onkeyup = function (event) {
    target = document.activeElement;
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if (e && e.keyCode) {
        if (target != null && target.tagName == "INPUT" && e.keyCode != 27) {//如果焦点在输入框中，并且按的不是esc则返回
            return;
        }
        // 如果不是字母数据（大概值）
        if ((e.keyCode < 48 || e.keyCode > 90)) {
            switch (e.keyCode) {
                case 13:// 回车
                    var _c = it.charAt(0);
                    if (_c == SP_KEY) {
                        iopen();// 跳转（如果有）
                    }
                    return;
                case 32:// 空格
                    if (it) {
                        var _c = it.charAt(0);
                        if (_c == SP_KEY || _c != SP_KEY) {
                            iopen();// 跳转（如果有）
                        }
                        return;
                    }
                    break;
                case 27:// esc 取消
                    $("#kw").val("");
                    $("#kw").blur();
                    close(oldTipId);
                    return;
            }
        }
        if (timeClear)
            clearTimeout(timeClear);
        it += String.fromCharCode(e.keyCode);
        if (it != "") {
            if (it.length > 1 || KEYS.indexOf(it) >= 0) {
                // 提示输入键
                $("#tip").html(it);
            }
        }
        clearTimeout(timeClear);
        timeClear = setTimeout(function () {
            var _c = it.charAt(0);
            if (_c == SP_KEY && it.length > 1) {
                iopen();// 跳转（如果有）
            }
            close(oldTipId);
            timeClear = null;
        }, msgOutTime);
        var _c = it.charAt(0);

        if (_c == SP_KEY) {//是特殊键
            var _t = it.substr(1);
            var _sum = linksKeys.split("," + _t).length;
            if (_t && _sum == 2) {// 为了保证"ab","ac"都可用
                iopen();// 跳转
                _t = "";
            } else if (_sum == 1) {
                it = "";
                close(oldTipId);
            }
            return;
        } else if (_c == "S") {
            $("#kw")[0].focus();
            close(oldTipId);
        } else if (_c == "E") {
            editData(true);
            close(oldTipId);
        } else if (_c == "V") {
            editData(false);
            close(oldTipId);
        } else if (_c == "T") {
            if (toolViewFlag == 0) {
                tool();
            } else {
                close(oldTipId);
                toolViewFlag = 0;
            }
        } else {
            if (it == _c && it != "") {//如果不是有效的，则不显示按键
                close(oldTipId);
            }
        }
    }
};

function iopen() {
    var _key = it.substr(1);
    if (!_key) {
        return;
    }
    var _u = links[_key];
    console.log(_u);
    if (_u) {
        _u = _u["l"];
        close(oldTipId);
        var _urls = _u.split(",");
    console.log(_u);
        $.each(_urls, function (i, _url) {
            window.open(_url.indexOf("://") >= 0 ? _url : "http://" + _url, "_blank");
        });
        it = "";
        return;
    }
}

//点击
function iclick(url) {
    var _urls = url.split(",");
    $.each(_urls, function (i, _url) {
        window.open(_url.indexOf("://") >= 0 ? _url : "http://" + _url, "_blank");
    });
}
//点击处理
function icl(){
}

//处理连接地址
function fixUrl(_tmpUrl) {
    return _tmpUrl.indexOf("://") < 0 ? "http://" + _tmpUrl : _tmpUrl;
}

//处理显示文字长度
function fixContent(str) {
    if (!str) {
        return "";
    } else {
        var _ret = "";
        var _l = 0;
        for (var i = 0; i < str.length && _l < 13; i++) {
            var c = str.charCodeAt(i);
            if (c >= 0 && c <= 128) _l += 1;
            else _l += 2;
            _ret += str.charAt(i);
        }
        if (getBLen(str) > 13) {
            _ret += "..";
        }
        return _ret;
    }
}

//获取长度中文两位
function getBLen(str) {
    if (str == null) return 0;
    if (typeof str != "string") {
        str += "";
    }
    return str.replace(/[^\x00-\xff]/g, "01").length;
}
function tool() {
    toolViewFlag = layer.open({
        type: 2,
        title: ['简单工具', 'padding-left:80px;'],
        shadeClose: true,
        shade: 0.1,
        shift: 5,
        area: ['90%', '100%'],
        maxmin: true, //开启最大化最小化按钮
        content: '/static/alltool.html?v11',
        end: function () {
            toolViewFlag = 0
        }
    });
}


function close(id) {
    it = "";
    $("#tip").html(it);
}
