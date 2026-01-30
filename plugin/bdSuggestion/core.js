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
        BaiduSuggestion.bind(
            "kw",
            {
                "XOffset":6, //提示框位置横向偏移量,单位px
                "YOffset":-6, //提示框位置纵向偏移量,单位px
                "width":456, //提示框宽度，单位px
                "fontColor":"#555", //提示框文字颜色
                "fontColorHI":"#FFF",	//提示框高亮选择时文字颜色
                "fontSize":"16px",	//文字大小
                "fontFamily":"宋体",	//文字字体
                "borderColor":"#ddd", //提示框的边框颜色
                "bgcolorHI":"#aaa",	//提示框高亮选择的颜色
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