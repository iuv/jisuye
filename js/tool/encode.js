encode = {
	exe : function(param){
		var _res = this.main(param);
		_MAIN_["sysPrint"](_OUT_,_res);
	},
	main : function(type){
		var _ret = "", _flag = true;;
		var _map = {"u8":"Utf8", "a":"ASCII"};
		if(",u8,a,".indexOf(type) >=0 ){
			var _fun = "n-"+type,_cls = "encode",_tit=_map[type]+"转Native";
			//如果有缓存的方法
			if(_MAIN_["_fun_"] && _MAIN_["_fun_"].split("-").length == 2){
				var _tmp = _MAIN_["_fun_"].split("-");
				if(_tmp[0] == type || _tmp[1] == type){
					_fun = _tmp[1]+"-"+_tmp[0];
					_tit = (_map[_tmp[1]] ? _map[_tmp[1]] : "Native转" ) + (_map[_tmp[0]] ? _map[_tmp[0]] : "转Native");
					_ret = this.mainExe(_fun)
					_flag = false;
				}
			} 
			if(_flag){
				_ret = this.mainExe(_fun);
			}
			_MAIN_["saveHistory"](_tit, _cls, _fun);
		} else {
			_ret = this.mainExe(type);
			let _tit = "URL"+(type.indexOf("+")>0 ? "编码" : "解码");
			_MAIN_["saveHistory"](_tit, "encode", type);
		}
		return _ret;
	},
	mainExe : function(type){
		var src = $("#"+_IN_).val();
		var _ret = ""; 
		switch (type) {
		case "n-u8" :
			_ret = src.replace(/[^\u0000-\u00FF]/g, function ($0) { return escape($0).replace(/(%u)(\w{4})/gi, "&#x$2;") });
			break;
		case "u8-n" :
			_ret = unescape(src.replace(/&#x/g, '%u').replace(/;/g, ''));
			break;
		case "n-a" :
			for(var i=0;i<src.length;i++){
				var code=Number(src[i].charCodeAt(0));
				if(code>127){
					var charAscii=code.toString(16);
					charAscii=new String("0000").substring(charAscii.length,4)+charAscii;
					_ret+="\\u"+charAscii;
				} else {
					_ret+=src[i];
				}
			}
			break;
		case "a-n" :
			var srcs = src.split("\\u");
			_ret =srcs[0];
			for(var i=1;i<srcs.length;i++){
				var c=srcs[i];
				_ret+=String.fromCharCode(parseInt("0x"+c.substring(0,4)));
				if(c.length>4){
					_ret += c.substring(4,c.length);
				}
			}
			break;
		case "url+" :
			_ret = encodeURIComponent(src);
			break;
        case "url-" :
            _ret = decodeURIComponent(src);
            break;

		}
		return _ret;
	}
};
_MAIN_["encode"] = encode ;