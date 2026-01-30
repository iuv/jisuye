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
        // 使用国际化文本
        let displayName = n;
        if (typeof i18n !== 'undefined') {
            if (n === "搜索提示") {
                displayName = i18n.t('pluginSearchTip');
            } else if (n === "天气插件") {
                displayName = i18n.t('pluginWeather');
            }
        }
        html += "<div><span>"+displayName+":</span><span><input type='checkbox' onclick='setPlugin(\""+n+"\", this)' "+(PLJSON[n] ? "checked":"")+" /></span></div>";
        // 如果开启状态，则加载插件js
        loadPlugin(n);
    }
    const plugin = document.getElementById("plugin");
    if(plugin) plugin.innerHTML = html;
}
// 加载插件
function loadPlugin(n){
    if(PLJSON[n]){
        // 加载js
        const script = document.createElement('script');
        script.src = "plugin/"+PL[n]+"/core.js";
        script.onload = function(){
            PLFUN[PL[n]].init();
        };
        document.head.appendChild(script);
    } else {
        // 卸载插件
        if(PLFUN[PL[n]]){
            PLFUN[PL[n]].uninit();
        }
    }
}
// 显示设置页面
function setting(){
    const setting = document.getElementById("setting");
    if(setting) setting.style.display = "block";
}
// 关闭设置页面
function closeSetting(){
    const setting = document.getElementById("setting");
    if(setting) setting.style.display = "none";
}
// 保存设置
function setPlugin(name, t){
    let v = t.checked;
    PLJSON[name]=v;
    // cookie保存300天
    Cookies.set("plugin", JSON.stringify(PLJSON), {expires: 300, path:'/'});
    loadPlugin(name);
}
// 判断插件启用情况
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        let pjson = Cookies.get("plugin");
        if(pjson){
            PLJSON = JSON.parse(pjson);
        }
        // 如果用户没用登录默认开启搜索提示
        if(!user){
            PLJSON["搜索提示"]=true;
        }
        pluginInit();
    });
} else {
    let pjson = Cookies.get("plugin");
    if(pjson){
        PLJSON = JSON.parse(pjson);
    }
    // 如果用户没用登录默认开启搜索提示
    if(!user){
        PLJSON["搜索提示"]=true;
    }
    pluginInit();
}

// 更新插件国际化文本
function updatePluginI18n() {
    pluginInit();
}