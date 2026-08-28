// 原生加载脚本
function loadScript(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    script.onerror = () => console.error('Failed to load script:', url);
    document.head.appendChild(script);
}

bdSuggestion = {
    init : function(){
        loadScript("plugin/bdSuggestion/bdSuggestion.js", this.bind);
    },
    uninit : function(){
        
    },
    bind : function(){
        function cssVar(name, fallback) {
            var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
            return v || fallback;
        }
        BaiduSuggestion.bind(
            "kw",
            {
                "XOffset":6, //提示框位置横向偏移量,单位px
                "YOffset":-6, //提示框位置纵向偏移量,单位px
                "width":456, //提示框宽度，单位px
                "fontColor": cssVar("--fg", "#555"),
                "fontColorHI": cssVar("--legend-fg", "#FFF"),
                "fontSize":"16px",	//文字大小
                "fontFamily": cssVar("--font", "Arial, Microsoft YaHei, sans-serif"),
                "borderColor": cssVar("--widget-bd", "#ddd"),
                "bgcolorHI": cssVar("--legend", "#aaa"),
                "sugSubmit":false	//选中提示框中词条时是否提交表单
            },
            function(txt){
                const form = document.getElementById("f");
                if(form) form.submit();
            }
        );
    }
};
PLFUN["bdSuggestion"] = bdSuggestion;