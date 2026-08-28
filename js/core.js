// global
var pass; // 加密密码
var json; // 数据json（Vue reactive）
var passList; // 密码管理json list
var user; // 当前用户
var ixx;
var url; // data地址
var appView = ''; // nav | keymap | pass
var sortableList = [];
var MAX_PASS_RETRY = 5;
var PASS_STORE_KEY = "jisuye_pass";
var LOCAL_DATA_KEY = "jisuye_local_data";
var dlgWait = null;
// github访问代理
var proxyList = ["https://ghproxy.com/","https://gh.api.99988866.xyz/"];
// 显示/编辑状态 默认显示
var ve = true;
var linksHidden = false;
// 保存从仓库获取原始数据，用于判断数据是否修改
var oldData;
// 快捷键索引：精确键 -> 链接；前缀 -> 完整键列表
var linkByKey = {};
var keysByPrefix = {};
var links = {}; // 兼容旧引用，指向 linkByKey
var linksKeys = ',';
var linkSidSeed = 1;

function showTip(msg) {
    const tip = document.getElementById("tip");
    if (tip) tip.textContent = msg || "";
}

function isGuest() {
    return !user;
}

function syncGuestUi() {
    document.body.classList.toggle("is-guest", isGuest());
}

function setUbodyView(name) {
    const el = document.getElementById("ubody");
    if (!el) return;
    if (name) el.setAttribute("data-view", name);
    else el.removeAttribute("data-view");
    if (name === "pass" || name === "keymap") setLinksHidden(false);
}

function setLinksHidden(hidden) {
    linksHidden = !!hidden;
    const el = document.getElementById("ubody");
    if (el) el.classList.toggle("links-hidden", linksHidden);
}

function toggleViewKey() {
    if (appView && appView !== "nav") {
        setLinksHidden(false);
        editData(false);
        return;
    }
    if (json && json.editStatus) {
        setLinksHidden(false);
        editData(false);
        return;
    }
    setLinksHidden(!linksHidden);
}

function readLocalData() {
    try {
        var s = localStorage.getItem(LOCAL_DATA_KEY);
        if (s && s.charAt(0) === "{") return s;
    } catch (e) {}
    return null;
}

function writeLocalData() {
    if (user || !json) return;
    try {
        localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(persistObject()));
    } catch (e) {}
}

function closePrompt(val) {
    var dlg = document.getElementById("dlg");
    var mask = document.getElementById("dlg-mask");
    if (dlg) dlg.classList.remove("open");
    if (mask) mask.classList.remove("open");
    var r = dlgWait;
    dlgWait = null;
    if (r) r(val);
}

function showPrompt(opts) {
    opts = opts || {};
    if (dlgWait) closePrompt(null);
    return new Promise(function (resolve) {
        var dlg = document.getElementById("dlg");
        var mask = document.getElementById("dlg-mask");
        var input = document.getElementById("dlg-input");
        var title = document.getElementById("dlg-title");
        var msg = document.getElementById("dlg-msg");
        var ok = document.getElementById("dlg-ok");
        var cancel = document.getElementById("dlg-cancel");
        var closeBtn = document.getElementById("dlg-x");
        var eye = document.getElementById("dlg-eye");
        if (!dlg || !input) {
            resolve(window.prompt(opts.message || "") );
            return;
        }
        dlgWait = resolve;
        var type = opts.type || "text";
        title.textContent = opts.title || "";
        msg.textContent = opts.message || "";
        input.type = type;
        input.value = opts.value || "";
        input.placeholder = opts.placeholder || "";
        ok.textContent = (typeof i18n !== "undefined") ? i18n.t("confirm") : "确定";
        cancel.textContent = (typeof i18n !== "undefined") ? i18n.t("cancel") : "取消";
        if (eye) {
            var isPass = type === "password";
            eye.hidden = !isPass;
            eye.textContent = (typeof i18n !== "undefined") ? i18n.t("show") : "显示";
            eye.onclick = function () {
                if (input.type === "password") {
                    input.type = "text";
                    eye.textContent = (typeof i18n !== "undefined") ? i18n.t("hide") : "隐藏";
                } else {
                    input.type = "password";
                    eye.textContent = (typeof i18n !== "undefined") ? i18n.t("show") : "显示";
                }
                input.focus();
            };
        }
        function onOk() { closePrompt(input.value); }
        function onCancel() { closePrompt(null); }
        ok.onclick = onOk;
        cancel.onclick = onCancel;
        if (closeBtn) closeBtn.onclick = onCancel;
        if (mask) mask.onclick = onCancel;
        input.onkeydown = function (e) {
            if (e.key === "Enter") { e.preventDefault(); onOk(); }
            else if (e.key === "Escape") { e.preventDefault(); onCancel(); }
        };
        if (mask) mask.classList.add("open");
        dlg.classList.add("open");
        setTimeout(function () { input.focus(); input.select(); }, 30);
    });
}

function getStoredPass() {
    try {
        let p = sessionStorage.getItem(PASS_STORE_KEY);
        if (p) return p;
        if (typeof Cookies !== "undefined") {
            p = Cookies.get("pass");
            if (p) {
                sessionStorage.setItem(PASS_STORE_KEY, p);
                Cookies.remove("pass");
                return p;
            }
        }
    } catch (e) {}
    return "";
}

function setStoredPass(p) {
    try {
        if (p) sessionStorage.setItem(PASS_STORE_KEY, p);
        else sessionStorage.removeItem(PASS_STORE_KEY);
    } catch (e) {}
    if (typeof Cookies !== "undefined") {
        try { Cookies.remove("pass"); } catch (e) {}
    }
}

function dataSnapshot() {
    if (!json) return "";
    const obj = JSON.parse(JSON.stringify(json));
    delete obj.editStatus;
    return JSON.stringify(obj);
}

function persistObject() {
    const obj = JSON.parse(JSON.stringify(json));
    delete obj.editStatus;
    if (obj.links) {
        obj.links.forEach(function (g) {
            (g.list || []).forEach(function (l) {
                delete l._sid;
            });
        });
    }
    return obj;
}

function tagAllLinkSids() {
    if (!json || !json.links) return;
    for (var i = 0; i < json.links.length; i++) {
        var list = json.links[i].list || [];
        for (var j = 0; j < list.length; j++) {
            if (list[j] && list[j]._sid == null) list[j]._sid = linkSidSeed++;
        }
    }
}

function withHttps(u) {
    if (!u) return u;
    return String(u).indexOf("://") >= 0 ? u : "https://" + u;
}

function rebuildShortcutIndex() {
    tagAllLinkSids();
    linkByKey = {};
    keysByPrefix = {};
    links = linkByKey;
    linksKeys = ',';
    if (!json || !json.links) return;
    for (var i = 0; i < json.links.length; i++) {
        var group = json.links[i];
        var list = group && group.list ? group.list : [];
        for (var j = 0; j < list.length; j++) {
            var l = list[j];
            if (!l || !l.k) continue;
            var kk = String(l.k).toLocaleUpperCase();
            linkByKey[kk] = l;
            linksKeys += kk + ",";
            for (var n = 1; n <= kk.length; n++) {
                var prefix = kk.substring(0, n);
                if (!keysByPrefix[prefix]) keysByPrefix[prefix] = [];
                keysByPrefix[prefix].push(kk);
            }
        }
    }
}

function getLinksByPrefix(prefix) {
    if (!prefix) return [];
    var keys = keysByPrefix[String(prefix).toLocaleUpperCase()] || [];
    var result = [];
    for (var i = 0; i < keys.length; i++) {
        result.push(linkByKey[keys[i]]);
    }
    return result;
}

function getLinkByKey(key) {
    if (!key) return null;
    key = String(key).toLocaleUpperCase();
    if (linkByKey[key]) return linkByKey[key];
    var keys = keysByPrefix[key] || [];
    if (keys.length === 1) return linkByKey[keys[0]];
    return null;
}

function countPrefixMatches(prefix) {
    if (!prefix) return 0;
    var keys = keysByPrefix[String(prefix).toLocaleUpperCase()];
    return keys ? keys.length : 0;
}

function unmountApp() {
    destroySortable();
    if (ixx) {
        try { ixx.unmount(); } catch (e) {}
        ixx = null;
    }
    appView = '';
    setUbodyView("");
}

function mountNavApp() {
    if (appView === 'nav' && ixx) return;
    unmountApp();
    if (!json) return;
    if (json.editStatus == null) json.editStatus = false;
    ixx = Vue.createApp({
        data() {
            return json;
        },
        template: "#tpl"
    });
    ixx.mount('#ubody');
    appView = 'nav';
    setUbodyView("nav");
}

function destroySortable() {
    for (var i = 0; i < sortableList.length; i++) {
        try { sortableList[i].destroy(); } catch (e) {}
    }
    sortableList = [];
}

function syncGroupOrderFromDom(fieldset) {
    if (!fieldset || !json || !json.links) return false;
    const firstIl = fieldset.querySelector(":scope > .il");
    if (!firstIl) return false;
    const typeIdx = parseInt(firstIl.getAttribute("data-g"), 10);
    if (isNaN(typeIdx) || !json.links[typeIdx] || !json.links[typeIdx].list) return false;
    const oldList = json.links[typeIdx].list;
    const nodes = fieldset.querySelectorAll(":scope > .il");
    const newList = [];
    const used = {};
    nodes.forEach(function (node) {
        const i = parseInt(node.getAttribute("data-i"), 10);
        if (!isNaN(i) && oldList[i] && !used[i]) {
            newList.push(oldList[i]);
            used[i] = true;
        }
    });
    oldList.forEach(function (item, i) {
        if (!used[i]) newList.push(item);
    });
    var changed = newList.length !== oldList.length;
    if (!changed) {
        for (var i = 0; i < newList.length; i++) {
            if (newList[i] !== oldList[i]) {
                changed = true;
                break;
            }
        }
    }
    if (!changed) return false;
    oldList.splice.apply(oldList, [0, oldList.length].concat(newList));
    rebuildShortcutIndex();
    updateData();
    return true;
}

function initSortable() {
    destroySortable();
    if (typeof Sortable === "undefined" || !json || !json.editStatus) return;
    let divs = document.querySelectorAll("#ubody > div");
    for (var i = 0; i < divs.length - 1; i++) {
        let fi = document.querySelector("#ubody > div:nth-child(" + (i + 1) + ")>fieldset");
        if (!fi) continue;
        sortableList.push(Sortable.create(fi, {
            animation: 150,
            draggable: ".il",
            handle: ".ila",
            filter: "legend, .no-sort",
            preventOnFilter: false,
            forceFallback: true,
            fallbackOnBody: true,
            fallbackTolerance: 3,
            onEnd: function (e) {
                const fieldset = e.from;
                setTimeout(function () {
                    syncGroupOrderFromDom(fieldset);
                }, 0);
            }
        }));
    }
}

function afterNavRender() {
    Vue.nextTick(function () {
        if (json && json.editStatus) initSortable();
        else destroySortable();
        if (typeof i18n !== 'undefined') i18n.updateEditForm();
    });
}

function showLoadError() {
    const msg = typeof i18n !== 'undefined' ? i18n.t('loadFailed') : '加载失败';
    showTip(msg);
    const ubody = document.getElementById("ubody");
    if (ubody) {
        const tipText = typeof i18n !== 'undefined' ? i18n.t('loadFailedTip') : '';
        ubody.innerHTML = '<div class="load-error">' + tipText + '</div>';
        setUbodyView("error");
    }
}

async function decryptNavData(raw) {
    pass = getStoredPass();
    let txt = i18n.t('promptPassword');
    for (let i = 0; i < MAX_PASS_RETRY; i++) {
        if (!pass) {
            pass = await showPrompt({
                type: "password",
                title: i18n.t("promptPasswordTitle"),
                message: txt
            });
            if (!pass) return null;
        }
        try {
            var decrypted = CryptoJS.AES.decrypt(raw, pass);
            var plain = decrypted.toString(CryptoJS.enc.Utf8);
            if (!plain) throw new Error('empty');
            plain = unzip(plain);
            JSON.parse(plain);
            setStoredPass(pass);
            return plain;
        } catch (error) {
            pass = "";
            setStoredPass("");
            txt = i18n.t('passwordErrorRetry', { n: i + 1, max: MAX_PASS_RETRY });
        }
    }
    showTip(i18n.t('passwordRetryLimit'));
    return null;
}

function applyNavData(d) {
    const copyEl = document.getElementById("copyAndCommit");
    if (copyEl) copyEl.setAttribute("data-clipboard-text", d);
    if (!d.startsWith("{")) {
        decryptNavData(d).then(function (plain) {
            if (plain == null) return;
            applyNavDataParsed(plain);
        });
        return;
    }
    applyNavDataParsed(d);
}

function applyNavDataParsed(d) {
    try {
        json = Vue.reactive(JSON.parse(d));
    } catch (e) {
        showLoadError();
        return;
    }
    if (!json.links) json.links = [];
    json.editStatus = false;
    oldData = dataSnapshot();
    if (json.kw_ext) {
        const kwExtEl = document.getElementById("kw_ext");
        if (kwExtEl) kwExtEl.value = json.kw_ext;
    }
    rebuildShortcutIndex();
    mountNavApp();
    showTip('');
    const kwEl = document.getElementById("kw");
    if (kwEl) {
        const iframe = document.createElement("iframe");
        iframe.src = "https://google.com/ncr";
        iframe.id = "aigoogle";
        iframe.style.display = "none";
        iframe.onload = function () { changeso(1, 1); };
        kwEl.appendChild(iframe);
    }
    setTimeout(function () {
        const aigoogleEl = document.getElementById("aigoogle");
        if (aigoogleEl && aigoogleEl.parentNode) {
            aigoogleEl.parentNode.removeChild(aigoogleEl);
        }
    }, 2000);
}

// init
function init(){
    i18n.init();
    let proxy = Cookies.get("proxy");
    for (var i = 0; i < proxyList.length; i++) {
        let ptmp = proxyList[i];
        let html = "<option value='" + ptmp + "' " + (ptmp == proxy ? "selected" : "") + " >代理-" + (i + 1) + "</option>";
        const proxyEl = document.getElementById("proxy");
        if (proxyEl) proxyEl.insertAdjacentHTML('beforeend', html);
    }
    let html = "<option value='0'>自定义</option>";
    const proxyEl = document.getElementById("proxy");
    if (proxyEl) proxyEl.insertAdjacentHTML('beforeend', html);
    let href = location.href;
    let allurl = "js/data";
    if (href.lastIndexOf("?") > 0) {
        user = href.substring(href.lastIndexOf("?") + 1);
        url = user + "/jisuye-data/main/data.json";
        if (user == "demo") {
            url = "iuv/jisuye-data/main/data.json";
        }
        if (user == "iuv") {
            url = "iuv/my-data/main/data.json";
        }
        const loginEl = document.getElementById("login");
        if (loginEl) loginEl.style.display = "";
        allurl = (proxy ? proxy : "") + "https://raw.githubusercontent.com/" + url;
    }
    i18n.updatePage();
    syncGuestUi();
    if (!user) {
        var local = readLocalData();
        if (local) {
            applyNavData(local);
            return;
        }
    }
    showTip(i18n.t('loading'));
    get(
        allurl,
        function (d) {
            applyNavData(d);
        },
        function () {
            if (!user) {
                json = Vue.reactive({ links: [], editStatus: false });
                oldData = dataSnapshot();
                rebuildShortcutIndex();
                mountNavApp();
                showTip('');
                return;
            }
            showLoadError();
        }
    );
}
// 显示/隐藏编辑链接
function editData(t){
    if (typeof Sortable !== "undefined") {
        editDataBase(t);
    } else {
        loadScript("js/Sortable.js", function () {
            editDataBase(t);
        });
    }
}
function editDataBase(t){
    ve = !t;
    if (!json) return;
    if (t) setLinksHidden(false);
    mountNavApp();
    json.editStatus = !!t;
    rebuildShortcutIndex();
    updateData();
    afterNavRender();
}
// 显快捷键对应链接
function showKeymap(k){
    let tmpLinks = getLinksByPrefix(k);
    unmountApp();
    ixx = Vue.createApp({
        data() {
            return { tmpLinks: tmpLinks };
        },
        template: "#keymap"
    });
    ixx.mount('#ubody');
    appView = 'keymap';
    setUbodyView("keymap");
    if (typeof i18n !== "undefined") {
        const hint = document.querySelector(".keymap-hint");
        if (hint) hint.textContent = i18n.t("keymapHint");
    }
}
// 交换连接位置
function swapLink(typeIdx, fromIdx, toIdx){
    const array = json.links[parseInt(typeIdx)].list;
    const element = array.splice(parseInt(fromIdx), 1)[0];
    array.splice(parseInt(toIdx), 0, element);
}
// 显示链接信息
function editLink(id, status){
    let ids = id.split("-");
    let groupIdx = parseInt(ids[1]);
    // 检查是否是新增链接（只有2个部分）或编辑现有链接（3个部分）
    if(ids.length < 3){
        if(status){
            const el = document.getElementById(id);
            if(el) el.style.display = "block";
        } else {
            const el = document.getElementById(id);
            if(el) el.style.display = "none";
        }
        return;
    }

    let linkIdx = parseInt(ids[2]);
    if(status){
        const el = document.getElementById(id);
        if(el) el.style.display = "block";
    } else {
        let ipts = document.querySelectorAll("#"+id+" input");
        if(ipts.length === 0){
            const el = document.getElementById(id);
            if(el) el.style.display = "none";
            return;
        }
        let targetGroup = parseInt(ipts[ipts.length - 1].value);
        if(targetGroup !== groupIdx){
            let v = json.links[groupIdx].list.splice(linkIdx,1);
            json.links[targetGroup].list.push(v[0]);
            editData(true);
            updateData();
        } else {
            const el = document.getElementById(id);
            if(el) el.style.display = "none";
        }
    }
}
// 新增链接
function saveLink(id){
    let ipts = document.querySelectorAll("#"+id+" input");
    let n = ipts[0].value;
    let l = ipts[1].value;
    l = withHttps(l);
    let c = ipts[2].value;
    let k = ipts[3].value;
    let v = "1";
    let ids = id.split("-");
    let groupIdx = parseInt(ids[1]);
    json.links[groupIdx].list.push({n: n, l: l, c: c, k: k, v: v});
    editData(true);
}
// 删除链接
function delLink(id){
    let ids = id.split("-");
    let groupIdx = parseInt(ids[1]);
    let linkIdx = parseInt(ids[2]);
    json.links[groupIdx].list.splice(linkIdx,1);
    editData(true);
}
// 切换显示/隐藏
function toggleView(linkId){
    let ids = linkId.split("-");
    let groupIdx = parseInt(ids[0]);
    let linkIdx = parseInt(ids[1]);
    let link = json.links[groupIdx].list[linkIdx];
    if(link){
        link.v = link.v === '0' ? '1' : '0';
        updateData();
        if (typeof i18n !== "undefined") {
            Vue.nextTick(function () { i18n.updateEditForm(); });
        }
    }
}

// 移动类型type（0:向上，1:向下）
function moveGroup(id, type){
    let ids = id.split("-");
    let list = json.links;
    let idx = parseInt(ids[1]);
    let tmp = list[idx];
    if(type==0 && idx>0){
        list[idx]=list[idx-1];
        list[idx-1]=tmp;
    }
    if(type==1 && idx<list.length-1){
        list[idx]=list[idx+1];
        list[idx+1]=tmp;
    }
    editData(true);
}
// 显示分组信息
function editGroup(id, status){
    if(status){
        const el = document.getElementById(id);
        if(el) el.style.display = "";
    } else {
        const el = document.getElementById(id);
        if(el) el.style.display = "none";
    }
}
// 新增链接
function saveGroup(id){
    let ipts = document.querySelectorAll("#"+id+" input");
    let n = ipts[0].value;
    json.links.push({group: n, list:[]});
    editData(true);
}
// 删除链接
function delGroup(id){
    let ids = id.split("-");
    json.links.splice(ids[1],1);
    editData(true);
}
// zip压缩
function zip(j){
    let jsonStr = btoa(encodeURIComponent(JSON.stringify(j)));
    let binaryString = pako.gzip(jsonStr);
    let arr = Array.from(binaryString);
    let s = "";
    arr.forEach((item, index) => {
        s += String.fromCharCode(item)
    })
    return btoa(s)
}
// zip解压缩
function unzip(str){
    let strData = atob(str);
    const charData = strData.split('').map(function (x) {
        return x.charCodeAt(0);
    });
    const binData = new Uint8Array(charData);
    const data = pako.inflate(binData);
    strData = String.fromCharCode.apply(null, new Uint16Array(data));
    return decodeURIComponent(atob(strData));
}
// 设置密码
async function setPass(){
    if (typeof closePanels === "function") closePanels();
    const p = await showPrompt({
        type: "password",
        title: i18n.t("setPasswordTitle"),
        message: i18n.t("promptPassword")
    });
    if (p === null) return;
    pass = p;
    updateData();
    setStoredPass(pass);
}
// 更新待复制数据
function updateData(){
    if (!json) return;
    const kwExtEl = document.getElementById("kw_ext");
    let kwExt = kwExtEl ? kwExtEl.value : "";
    if(kwExt){
        json.kw_ext = kwExt;
    }
    if(passList && passPass ){
        let pl = CryptoJS.AES.encrypt(zip(passList), passPass).toString();
        json["passList"] = pl;
    }
    const persist = persistObject();
    let txt = JSON.stringify(persist);
    if(pass){
        txt = zip(persist);
        txt = CryptoJS.AES.encrypt(txt, pass).toString();
    }
    const copyEl = document.getElementById("copyAndCommit");
    if(copyEl) copyEl.setAttribute("data-clipboard-text",txt);
    writeLocalData();
}
// 复制提交
function copyAndCommit(){
    oldData = dataSnapshot();
    window.open("https://github.com/"+url.replace("/main/","/edit/main/"),"_blank");
}
// 退出登录
function logout(){
    setStoredPass("");
    location.href="/";
}
// 设置代理
function setProxy(){
    const proxyEl = document.getElementById("proxy");
    let ptmp = proxyEl ? proxyEl.value : "";
    if(ptmp=="0"){
        showPrompt({
            type: "text",
            title: i18n.t("proxyTitle"),
            message: i18n.t("promptProxy")
        }).then(function (val) {
            if (val === null) return;
            ptmp = String(val).trim();
            if (ptmp && ptmp.charAt(ptmp.length - 1) !== "/") ptmp += "/";
            Cookies.set("proxy", ptmp, {expires: 300, path:'/'});
            location.href = location.href;
        });
        return;
    }
    Cookies.set("proxy", ptmp, {expires: 300, path:'/'});
    location.href=location.href;
}
// 导入收藏
function inBookmarks(){
    if(typeof saveBookmark === 'undefined'){
        loadScript("js/bookmarks.js");
    }
    closeSetting();
    const el = document.getElementById('inBookmarks');
    if(el) el.style.display = "block";
}
// 如果数据有修改则阻止网页关闭
window.addEventListener("beforeunload", function (event) {
    if(user && json && dataSnapshot() != oldData){
        event.preventDefault();
        event.returnValue = "";
    }
});
// 原生 GET 请求
function get(url, callback, errorCallback) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            if (callback) callback(data);
        })
        .catch(error => {
            console.error('GET request failed:', error);
            if (errorCallback) errorCallback(error);
        });
}
// 原生加载脚本
function loadScript(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    script.onerror = () => console.error('Failed to load script:', url);
    document.head.appendChild(script);
}
// DOM 加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        init();
        var clipboard = new Clipboard('#copyAndCommit');
        clipboard.on('success', function(e) {
            copyAndCommit();
        });
    });
} else {
    init();
    var clipboard = new Clipboard('#copyAndCommit');
    clipboard.on('success', function(e) {
        copyAndCommit();
    });
}
