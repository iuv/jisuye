// 原生加载脚本
function loadScript(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    script.onerror = () => console.error('Failed to load script:', url);
    document.head.appendChild(script);
}

format = {
	exe : function(param){
        var _ret;
		if(typeof window.formatJS != "undefined"){
			_ret = this.main(param);
			_MAIN_["sysPrint"]("",_ret,param);
		} else {
			var _t = this;
			loadScript("js/jquery.format.js", function(){
				_ret = _t.main(param);
				_MAIN_["sysPrint"]("",_ret,param);
			});
		}
		_MAIN_["saveHistory"](param+"格式化","format", param);
	},
	main : function(type){
		const el = document.getElementById(_IN_);
		var _v = el ? el.value.trim() : "";
		var _ret = typeof window.formatJS !== "undefined" ? window.formatJS(_v, {method:type}) : _v;
		if(type == "xml"){
			_ret = _ret.split("<").join("&lt;");
			_ret = _ret.split(">").join("&gt;");
		}
		return _ret;
	}
};
_MAIN_["format"] = format;