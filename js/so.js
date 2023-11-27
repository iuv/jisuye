//全局变量
var _so_type_="2";
var _so_types = "dgbys3hal";
var _history = "";
/*搜索引擎*/
function so(b){
	var _val = $("#kw").val();
	if(!_val){
		return;
	}
	var _vl = _val.indexOf("@");
	var _so_tmp = _so_type_;
    var stype = _val.substr(_vl+1);
    stype = stype.split("，").join(",");
    if(_vl>0 && (stype.length<=2 || stype.indexOf(",")>0) && _so_types.indexOf(_val.substr(_vl+1,1).toLowerCase())>=0){
        if(stype.indexOf(",")>0){
            _val = _val.substr(0, _vl);
            $(stype.split(",")).each(function(i, v){
                _so_tmp = _so_types.indexOf(v)+"";
                if(_so_tmp >=0){
                    goSo(_val, _so_tmp, b);
                }
            });
        } else {
            _so_tmp = _so_types.indexOf(_val.substr(_vl+1,1).toLowerCase())+"";
            if(_val.length - _vl == 2){
                if(changeso(_so_tmp) == 'err'){
                    return;
                }
                _so_type_ = _so_tmp;
            }
            _val = _val.substr(0, _vl);
            goSo(_val, _so_tmp, b);
        }
	} else {
        goSo(_val, _so_type_, b);
    }
    return false;
}
function goSo(_val, _so_tmp, b){
    var url;
    switch(_so_tmp){
        case '0':url="http://www.baidu.com/s?wd=";break;
        case '1':
            if(_val.endsWith(" a")){
                url = "https://www.google.com/search?btnI=%C2%A0%E6%89%8B%E6%B0%94%E4%B8%8D%E9%94%99%C2%A0&newwindow=1&hl=zh-CN&iflsig=AO6bgOgAAAAAZWROWkO6Qp77kU9--jElyEoV2jJBxJrg&q="
                _val = _val.substr(0, _val.length-2);
            } else {
                url="https://www.google.com/search?newwindow=1&q=";
            }
            break;
        case '2':url="http://bing.com/search?q=";break;
        case '3':url="http://www.yahoo.com.cn/search?p=";break;
        case '4':url="http://www.sogou.com/web?ie=utf8&query=";break;
        case '5':url="http://www.so.com/s?ie=utf-8&src=360sou_home&q=";break;
        case '6':url="https://github.com/search?q=";break;
        case '7':url="https://devv.ai/search/";break;
        case '8':url="http://linux.51yip.com/search/";break;
    }
    _val = _val.split("#").join("%23");
    _val = _val.split("&").join("%26");
    var _ext = $("#kw_ext").val();
    _ext = _ext && (_so_tmp<6||_so_tmp ==9) ? " "+_ext : "";
    if(_val.endsWith(" split")){
        _val = _val.replace(" split","");
        _vals = _val.split(",");
        for(i =0;i<_vals.length;i++){
            window.open(url+_vals[i]+_ext);
        }
    }else{
        var _jsy = "";
        if(b &&(b.ctrlKey || b.altKey)){
            _jsy = "&jisuye=";
            if(b.ctrlKey){
                _jsy += "2";
            } else {
                _jsy += "1";
            }
        }
        url += _val + _ext + _jsy;
        window.open(url);
    }
    _history = _val;
    //clear text
    $("#kw").val("");
    $("#kw").blur();
}

function changeso(type,login){
    // 如果没有登陆则验证不能选自定义
	$("#a"+(parseInt(_so_type_)+1)).removeClass("sotit2");
	$("#a"+(parseInt(type)+1)).addClass("sotit2");
	_so_type_ = type+"";
}
$(document).ready(function() {
	$("#kw").bind("keyup",function(event) {
        if(event.keyCode == "13") {//回车
            document.activeElement.blur();//收起虚拟键盘
            so(event);
            event.preventDefault(); // 阻止默认事件---阻止页面刷新
        } else if($("#kw").val() == " " && event.keyCode == "32" && _history != "") {//up
            $("#kw").val(_history);
		}
    });
});
