// 注册插件 插件名称最好4个字
var PL = {
    "搜索提示":"bdSuggestion",
    "天气插件":"weather",
}
// 注册插件方法在具体插件的core.js中注册
var PLFUN = {};
// 保存插件配置
var PLJSON = {};
// 初始化配置页面
function pluginInit(){
    let html = "";
    let keys = Object.keys(PL);
    for(let n of keys){
        html += "<div><span>"+n+":</span><span><input type='checkbox' onclick='setPlugin(\""+n+"\", this)' "+(PLJSON[n] ? "checked":"")+" /></span></div>";
        // 如果开启状态，则加载插件js
        loadPlugin(n);
    }
    $("#plugin").html(html);
}
// 加载插件
function loadPlugin(n){
    if(PLJSON[n]){
        // 加载js
        $.getScript("plugin/"+PL[n]+"/core.js", function(){
            PLFUN[PL[n]].init();
        });
    } else {
        // 卸载插件
        if(PLFUN[PL[n]]){
            PLFUN[PL[n]].uninit();
        }
    }
}
// 显示设置页面
function setting(){
    $("#setting").show();
}
// 关闭设置页面
function closeSetting(){
    $("#setting").hide();
}
// 保存设置
function setPlugin(name, t){
    let v = $(t).is(":checked");
    PLJSON[name]=v;
    // cookie保存300天
    var o = { expires: 300, path:'/' };
    $.cookie("plugin", JSON.stringify(PLJSON), o);
    loadPlugin(name);
}
// 判断插件启用情况
$(document).ready(function(){
    let pjson = $.cookie("plugin");
    if(pjson){
        PLJSON = JSON.parse(pjson);
    }
    // 如果用户没用登录默认开启搜索提示
    if(!user){
        PLJSON["搜索提示"]=true;
    }
    pluginInit();
});