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
    // 代理相关
    let proxy = $.cookie("proxy");
    for(var i=0;i<proxyList.length;i++){
        let ptmp = proxyList[i];
        let html = "<option value='"+ptmp+"' "+(ptmp==proxy?"selected":"")+" >代理-"+(i+1)+"</option>";
        $("#proxy").append(html);
    }
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
        $("#login").show();
        allurl = (proxy ? proxy : "")+ "https://raw.githubusercontent.com/"+url;
    }
    // 获取数据
    $.get(
        allurl,
        function(d){
            $("#copyAndCommit").attr("data-clipboard-text",d);
            // 判断是否要密码
            if(!d.startsWith("{")){
                // 从cookie中获取密码
                pass = $.cookie("pass");
                let txt = "请输入密码！";
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
                        txt = "密码错误！请重新输入!";
                        continue;
                    }
                    if(pass){
                        // cookie保存30天
                        var o = { expires: 30, path:'/' };
                        $.cookie("pass", pass, o);
                    } else {
                        return;
                    }
                    break;
                }
            }
            json = JSON.parse(d);
            oldData = d;
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
            $("#kw").append("<iframe src=\"https://google.com\" id='aigoogle' style='display: none' onload=\"changeso(1,1)\"></iframe>");
            setTimeout(function () { $("#aigoogle").remove()},2000);
        }
    );
}
// 显示/隐藏编辑链接
function editData(t){
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
    ixx.mount('#ubody')
    // 刷新要复制的数据
    updateData();
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
    console.log("showshow");
    console.log(tmpLinks);
    const { createApp } = Vue
    ixx = createApp({
        data() {
            return {"tmpLinks":tmpLinks};
        },
        template: "#keymap"
    });
    ixx.mount('#ubody')
}
// 移动链接type（0:前进，1:后退）
function moveLink(id, type){
    let ids = id.split("-");
    let list = json.links[ids[1]].list;
    idx = parseInt(ids[2])
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
// 显示链接信息
function editLink(id, status){
    let ipts = $("#"+id+" input");
    let t = $(ipts[4]).val();
    let ids = id.split("-");
    // 判断链接是否移动分类
    if(t && t != ids[1]){
        let v = json.links[ids[1]].list.splice(ids[2],1);
        json.links[t].list.push(v[0]);
        editData(true);
        updateData();
        return;
    }
    if(status){
        $("#"+id).show();
    } else {
        $("#"+id).hide();
    }
}
// 新增链接
function saveLink(id){
    let ipts = $("#"+id+" input");
    let n = $(ipts[0]).val();
    let l = $(ipts[1]).val();
    l = l.indexOf("://") >= 0 ? l : "http://"+l;
    let c = $(ipts[2]).val();
    let k = $(ipts[3]).val();
    let ids = id.split("-");
    json.links[ids[1]].list.push({n: n, l: l, c: c, k: k});
    editData(true);
}
// 删除链接
function delLink(id){
    let ids = id.split("-");
    json.links[ids[1]].list.splice(ids[2],1);
    editData(true);
}

// 移动类型type（0:向上，1:向下）
function moveGroup(id, type){
    let ids = id.split("-");
    let list = json.links;
    idx = parseInt(ids[1])
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
        $("#"+id).show();
    } else {
        $("#"+id).hide();
    }
}
// 新增链接
function saveGroup(id){
    let ipts = $("#"+id+" input");
    let n = $(ipts[0]).val();
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
    pass = window.prompt("请输入密码！"); 
    updateData();
    $.cookie("pass", pass);
}
// 更新待复制数据
function updateData(){
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
    $("#copyAndCommit").attr("data-clipboard-text",txt);
}
// 复制提交
function copyAndCommit(){
    oldData = JSON.stringify(json);
    // 打开github数据仓库页面
    window.open("https://github.com/"+url.replace("/main/","/edit/main/"),"_target");
}
// 退出登录
function logout(){
    $.cookie("pass", "");
    this.location.href="/";
}
// 设置代理
function setProxy(){
    let ptmp = $("#proxy").val();
    // cookie保存30天
    var o = { expires: 30, path:'/' };
    $.cookie("proxy", ptmp);
    this.location.href=this.location.href;
}
// 导入收藏
function inBookmarks(){
    // 加载js
    if(typeof saveBookmark === 'undefined'){
        $.getScript("js/bookmarks.js");
    }
    // 显示导入页面
    $('#inBookmarks').show();
}
// 如果数据有修改则阻止网页关闭
window.addEventListener("beforeunload", function (event) {
    let txt = JSON.stringify(json);
    if(txt != oldData){
        event.preventDefault();
        event.returnValue = "";
    }
});
$(document).ready(function(){
    init();
    var clipboard = new Clipboard('#copyAndCommit');
    clipboard.on('success', function(e) {
        copyAndCommit();
    });
});