format = {
	exe : function(param){
        var _ret;
		if(typeof $.format != "undefined"){
			_ret = this.main(param);
			_MAIN_["sysPrint"]("",_ret,param);
		} else {
			var _t = this;
			$.getScript("js/jquery.format.js", function(){
				_ret = _t.main(param);
				_MAIN_["sysPrint"]("",_ret,param);
			});
		}
		_MAIN_["saveHistory"](param+"格式化","format", param);
	},
	main : function(type){
		var _v = $("#"+_IN_).val().trim();
		var _ret = $.format(_v, {method:type});
		if(type == "xml"){
			_ret = _ret.split("<").join("&lt;");
			_ret = _ret.split(">").join("&gt;");
		}
		return _ret;
	}
};
_MAIN_["format"] = format;