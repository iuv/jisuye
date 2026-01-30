// global
var pass; // 加密密码
var json; // 数据json
var passList; // 密码管理json list
var user; // 当前用户
var ixx;
var url; // data地址
// github访问代理
var proxyList = ["https://ghproxy.com/","https://gh.api.99988866.xyz/"];
// 显示/编辑状态 默认显示
var ve = true;
// 保存从仓库获取原始数据，用于判断数据是否修改
var oldData;
// init
function init(){
    // 初始化国际化
    i18n.init();
    // 代理相关
    let proxy = Cookies.get("proxy");
    for(var i=0;i<proxyList.length;i++){
        let ptmp = proxyList[i];
        let html = "<option value='"+ptmp+"' "+(ptmp==proxy?"selected":"")+" >代理-"+(i+1)+"</option>";
        const proxyEl = document.getElementById("proxy");
        if(proxyEl) proxyEl.insertAdjacentHTML('beforeend', html);
    }
    let html = "<option value='0'>自定义</option>";
    const proxyEl = document.getElementById("proxy");
    if(proxyEl) proxyEl.insertAdjacentHTML('beforeend', html);
    // 获取用户名
    let href = location.href;
    let allurl = "js/data";
    if(href.lastIndexOf("?")>0){
        user = href.substring(href.lastIndexOf("?")+1);
        url = user+"/jisuye-data/main/data.json";
        // 处理demo数据
        if(user == "demo"){
            url = "iuv/jisuye-data/main/data.json";
        }
        if(user == "iuv"){
            url = "iuv/my-data/main/data.json";
        }
        // 显示用户操作
        const loginEl = document.getElementById("login");
        if(loginEl) loginEl.style.display = "";
        allurl = (proxy ? proxy : "")+ "https://raw.githubusercontent.com/"+url;
        // 更新国际化文本（login可能在init后显示，需要更新其文本）
        i18n.updatePage();
    }
    // 获取数据
    get(
        allurl,
        function(d){
            const copyEl = document.getElementById("copyAndCommit");
            if(copyEl) copyEl.setAttribute("data-clipboard-text",d);
            // 判断是否要密码
            if(!d.startsWith("{")){
                // 从cookie中获取密码
                pass = Cookies.get("pass");
                let txt = i18n.t('promptPassword');
                while(true){
                    if(!pass){
                        // 弹窗输入密码
                        pass = window.prompt(txt);
                    }
                    // 解密数据
                    try {
                        var decrypted = CryptoJS.AES.decrypt(d, pass);
                        d = decrypted.toString(CryptoJS.enc.Utf8);
                        d = unzip(d);
                    } catch (error) {
                        pass="";
                        txt = i18n.t('passwordError');
                        continue;
                    }
                    if(pass){
                        // cookie保存30天
                        Cookies.set("pass", pass, {expires: 30, path:'/'});
                    } else {
                        return;
                    }
                    break;
                }
            }
            json = JSON.parse(d);
            oldData = d;
            json.editStatus = false;
            // 处理kw_ext
            if(json.kw_ext){
                const kwExtEl = document.getElementById("kw_ext");
                if(kwExtEl) kwExtEl.value = json.kw_ext;
            }
            // 处理快捷键
            for(var i=0;i<json.links.length;i++){
                let link = json.links[i];
                if(link.list){
                    for(var j=0;j<link.list.length;j++){
                        let l = link.list[j];
                        if(l.k){
                            let kk = l.k.toLocaleUpperCase();
                            links[kk] = l;
                            linksKeys += kk + ",";
                        }
                    }
                }
            }
            // 处理json 显示连接
            const { createApp } = Vue
            ixx= createApp({
                data(){
                    return json;
                },
                template: "#tpl"
            });
            ixx.mount('#ubody')
            //如果能打开google则使用google
            const kwEl = document.getElementById("kw");
            if(kwEl){
                const iframe = document.createElement("iframe");
                iframe.src = "https://google.com/ncr";
                iframe.id = "aigoogle";
                iframe.style.display = "none";
                iframe.onload = function(){ changeso(1,1); };
                kwEl.appendChild(iframe);
            }
            setTimeout(function () {
                const aigoogleEl = document.getElementById("aigoogle");
                if(aigoogleEl && aigoogleEl.parentNode){
                    aigoogleEl.parentNode.removeChild(aigoogleEl);
                }
            },2000);
        }
    );
}
// 显示/隐藏编辑链接
function editData(t){
    if(typeof Sortable !== "undefined"){
        editDataBase(t);
    } else {
        loadScript("js/Sortable.js", function () {
            editDataBase(t);
        });
    }
}
function editDataBase(t){
    ve = !t;
    links = {};
    linksKeys = ',';
    ixx.unmount();
    // 处理快捷键
    for(var i=0;i<json.links.length;i++){
        let link = json.links[i];
        for(var j=0;j<link.list.length;j++){
            let l = link.list[j];
            if(l.k){
                let kk = l.k.toLocaleUpperCase();
                links[kk]=l;
                linksKeys+=kk+",";
            }
        }
    }
    const { createApp } = Vue
    json["editStatus"]=t;
    ixx = createApp({
        data() {
            return json;
        },
        template: "#tpl"
    });
    ixx.mount('#ubody');
    // 设置可拖动
    let divs = document.querySelectorAll("#ubody > div");
    for(var i=0;i<divs.length-1;i++){
        let fi = document.querySelector("#ubody > div:nth-child("+(i+1)+")>fieldset");
        Sortable.create(fi,{
            animation: 350,
            draggable: ".il",
            handle:".ila",
            onUpdate : function (e) {
                let typeIdx = e.item.id.split("-")[1];
                swapLink(typeIdx, e.oldIndex, e.newIndex);
                // 刷新要复制的数据
                updateData();
            }
        });
    }
    // 刷新要复制的数据
    updateData();
    // 更新编辑表单国际化文本
    if (typeof i18n !== 'undefined') {
        i18n.updateEditForm();
    }
}
// 显快捷键对应链接
function showKeymap(k){
    let tmpLinks = [];
    ixx.unmount();
    // 处理快捷键
    for(var i=0;i<json.links.length;i++){
        let link = json.links[i];
        for(var j=0;j<link.list.length;j++){
            let l = link.list[j];
            if(l.k && l.k.toLocaleUpperCase().startsWith(k.toLocaleUpperCase())){
                tmpLinks.push(l);
            }
        }
    }
    const { createApp } = Vue
    ixx = createApp({
        data() {
            return {"tmpLinks":tmpLinks};
        },
        template: "#keymap"
    });
    ixx.mount('#ubody')
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
        // 新增链接，直接关闭编辑框
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
        // 显示编辑框
        const el = document.getElementById(id);
        if(el) el.style.display = "block";
    } else {
        // 关闭编辑框，检查是否需要移动分类
        let ipts = document.querySelectorAll("#"+id+" input");
        if(ipts.length === 0){
            // 没有 input 的情况，直接关闭
            const el = document.getElementById(id);
            if(el) el.style.display = "none";
            return;
        }
        // 跳过单选按钮，取最后一个input（分类）
        let targetGroup = parseInt(ipts[ipts.length - 1].value);
        // 判断链接是否移动分类
        if(targetGroup !== groupIdx){
            let v = json.links[groupIdx].list.splice(linkIdx,1);
            json.links[targetGroup].list.push(v[0]);
            editData(true);
            updateData();
        } else {
            // 只是关闭编辑框，不移动
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
    l = l.indexOf("://") >= 0 ? l : "http://"+l;
    let c = ipts[2].value;
    let k = ipts[3].value;
    // 新增链接默认显示状态为"1"
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
        // 切换v属性的值：1变为0，0变为1
        let oldStatus = link.v;
        link.v = link.v === '0' ? '1' : '0';
        // 如果状态真的改变了，才需要更新UI
        if(oldStatus !== link.v){
            // 触发Vue更新以反映新的状态
            ixx.unmount();
            const { createApp } = Vue
            json["editStatus"] = json.editStatus;
            ixx = createApp({
                data() {
                    return json;
                },
                template: "#tpl"
            });
            ixx.mount('#ubody');
        }
        // 更新待复制的数据
        updateData();
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
function setPass(){
    pass = window.prompt(i18n.t('promptPassword'));
    updateData();
    Cookies.set("pass", pass);
}
// 更新待复制数据
function updateData(){
    // 保存kw_ext
    const kwExtEl = document.getElementById("kw_ext");
    let kwExt = kwExtEl ? kwExtEl.value : "";
    if(kwExt){
        json.kw_ext = kwExt;
    }
    // 密码管理数据
    if(passList && passPass ){
        let pl = CryptoJS.AES.encrypt(zip(passList), passPass).toString();
        json["passList"] = pl;
    }
    let txt = JSON.stringify(json);
    if(pass){
        // 压缩json
        txt = zip(json);
        // 加密数据
        txt = CryptoJS.AES.encrypt(txt, pass).toString();
    }
    const copyEl = document.getElementById("copyAndCommit");
    if(copyEl) copyEl.setAttribute("data-clipboard-text",txt);
}
// 复制提交
function copyAndCommit(){
    oldData = JSON.stringify(json);
    // 打开github数据仓库页面
    window.open("https://github.com/"+url.replace("/main/","/edit/main/"),"_target");
}
// 退出登录
function logout(){
    Cookies.remove("pass");
    this.location.href="/";
}
// 设置代理
function setProxy(){
    const proxyEl = document.getElementById("proxy");
    let ptmp = proxyEl ? proxyEl.value : "";
    if(ptmp=="0"){
        ptmp = window.prompt("请输入代理地址,以"/"结尾");
    }
    // cookie保存300天
    Cookies.set("proxy", ptmp, {expires: 300, path:'/'});
    this.location.href=this.location.href;
}
// 导入收藏
function inBookmarks(){
    // 加载js
    if(typeof saveBookmark === 'undefined'){
        loadScript("js/bookmarks.js");
    }
    closeSetting();
    // 显示导入页面
    const el = document.getElementById('inBookmarks');
    if(el) el.style.display = "block";
}
// 如果数据有修改则阻止网页关闭
window.addEventListener("beforeunload", function (event) {
    let txt = JSON.stringify(json);
    if(user && txt != oldData){
        event.preventDefault();
        event.returnValue = "";
    }
});
// 原生 GET 请求
function get(url, callback) {
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