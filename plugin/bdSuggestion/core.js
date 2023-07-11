//初始化百度下拉
function bdSuggestion(){
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
            $("#f").submit();
        }
    );
}
$(document).ready(function(){
    $.getScript("plugin/bdSuggestion/bdSuggestion.js", bdSuggestion);
});