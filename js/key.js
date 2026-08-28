//全局变量
var allLinkData = [];//所有收藏的链接
var SP_KEY = "G"; //特殊键
var KEYS = "VAETP" + SP_KEY;//所有有效的快捷键
var timeClear;
var it = "";
var oldTipId;
var msgOutTime = 1500;// msg显示失效时间（毫秒）

function isTypingTarget(el) {
    if (!el) return false;
    var tag = (el.tagName || "").toUpperCase();
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
    if (el.isContentEditable) return true;
    return false;
}

//阻止空格下滑
document.onkeydown = function(event) {
    if (isTypingTarget(event.target)) {
        return;
    };
    if (event.keyCode == 32) {
        event.preventDefault();
    };
}
document.onkeyup = function (event) {
    var target = document.activeElement;
    var e = event || window.event || arguments.callee.caller.arguments[0];
    if (e && e.keyCode) {
        var dlg = document.getElementById("dlg");
        if (dlg && dlg.classList.contains("open")) return;
        var findBox = document.getElementById("findContainer");
        if (findBox && findBox.style.display === "block") return;
        var setting = document.getElementById("setting");
        var skinPanel = document.getElementById("skin-panel");
        if ((setting && setting.classList.contains("open")) || (skinPanel && skinPanel.classList.contains("open"))) {
            if (e.keyCode == 27) return;
        }
        if (isTypingTarget(target) && e.keyCode != 27) {//输入中不触发全局快捷键
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
                    const kw = document.getElementById("kw");
                    if(kw){
                        kw.value = "";
                        kw.blur();
                    }
                    close(oldTipId);
                    editData(false);
                    return;
            }
        }
        if (timeClear)
            clearTimeout(timeClear);
        it += String.fromCharCode(e.keyCode);
        if (it != "") {
            if (it.length > 1 || KEYS.indexOf(it) >= 0) {
                // 提示输入键
                const tip = document.getElementById("tip");
                if(tip) tip.textContent = it;
            }
        }
        clearTimeout(timeClear);
        timeClear = setTimeout(function () {
            var _c = it.charAt(0);
            if (_c == SP_KEY && it.length > 1) {
                //iopen();// 跳转（如果有）
            }
            if(_c == "P"){
                close(true);
            }
            timeClear = null;
        }, msgOutTime);
        var _c = it.charAt(0);

        if (_c == SP_KEY) {//是特殊键
            var _t = it.substr(1);
            if (!_t) return;
            var _sum = countPrefixMatches(_t);
            if (_sum === 1) {
                iopen();
            } else if (_sum === 0) {
                editData(false);
                it = "";
                close(oldTipId);
            } else {
                showKeymap(_t);
            }
            return;
        } else if (_c == "S") {
            const kw = document.getElementById("kw");
            if(kw) kw.focus();
            close(oldTipId);
        } else if (_c == "E") {
            editData(true);
            close(oldTipId);
        } else if (_c == "V") {
            toggleViewKey();
            close(oldTipId);
        } else if (_c == "T") {
            window.open("/alltool.html","_blank")
            close(oldTipId);
        } else if (_c == "P") {
            showPass();
            close(true);
        } else if (_c == "F") {
            showFind();
        } else {
            if (it == _c && it != "") {//如果不是有效的，则不显示按键
                close(oldTipId);
            }
        }
    }
};

function iopen() {
    editData(false);
    var _key = it.substr(1);
    if (!_key) {
        return;
    }
    var _u = getLinkByKey(_key);
    if (_u) {
        _u = _u["l"];
        close(oldTipId);
        var _urls = _u.split(",");
        _urls.forEach(function(_url) {
            window.open(fixUrl(_url), "_blank");
        });
        it = "";
        return;
    }
}

//点击
function iclick(url) {
    var _urls = url.split(",");
    _urls.forEach(function(_url) {
        window.open(fixUrl(_url), "_blank");
    });
}
//点击处理
function icl(){
}

//处理连接地址
function fixUrl(_tmpUrl) {
    return withHttps(_tmpUrl);
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

function close(id) {
    clearTimeout(timeClear);
    it = "";
    const tip = document.getElementById("tip");
    if(tip) tip.textContent = it;
}
