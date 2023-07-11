// 注册插件 插件名称最好4个字
var PL = {
    "搜索提示":"bdSuggestion",
}
var PLJSON={};
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
        $.getScript("plugin/"+PL[n]+"/core.js");
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
    $.cookie("plugin", JSON.stringify(PLJSON));
    loadPlugin(name);
}
// 判断插件启用情况
$(document).ready(function(){
    let pjson = $.cookie("plugin");
    if(pjson){
        PLJSON = JSON.parse(pjson);
    }
    pluginInit();
});