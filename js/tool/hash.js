hash = {
	exe : function(param){
		if(typeof CryptoJS != "undefined"){
			this.load(param);
		} else {
			var _t = this;
			$.getScript("js/crypto-js/core.js", function(){
				_t.load(param);
			});
		}
	},
	load : function(param){
		type = param.replace("abc-","").replace("-abc","");
		var _ts = {"des":["DES","crypto-js"],"aes":["AES","crypto-js"],"base64":["enc","Base64","enc-base64"]};
		var _tst = _ts[type];
		if(!_tst){
			_tst = [type.toUpperCase(),type];
		}
		if(_tst.length == 2 && typeof CryptoJS[_tst[0]] != "undefined"){
			var _res = this.main(param);
			_MAIN_["sysPrint"](_OUT_,_res);
		} else if(_tst.length == 3 && typeof CryptoJS[_tst[0]][_tst[1]] != "undefined"){
			var _res = this.main(param);
			_MAIN_["sysPrint"](_OUT_,_res);
		} else {
			var _t = this;
			$.getScript("js/crypto-js/"+_tst[_tst.length-1]+".js", function(){
				var _res = _t.main(param);
				_MAIN_["sysPrint"](_OUT_,_res);
			}).done(function(script, textStatus) {
				  console.log( textStatus );
			})
			.fail(function(jqxhr, settings, exception) {
				console.log("3"+exception);
			})
			.complete(function(){
				console.log("xx");
			});
		}
	},
	main : function(type){
		var _ret = "", _flag = true;
		if(",des,aes,base64,".indexOf(type) >=0 ){
			var _fun = type+"-abc",_cls = "hash",_tit=type.toUpperCase()+"解";
			//如果有缓存的方法
			if(_MAIN_["_fun_"] && _MAIN_["_fun_"].split("-").length == 2){
				var _tmp = _MAIN_["_fun_"].split("-");
				if(_tmp[0] == type || _tmp[1] == type){
					_fun = _tmp[1]+"-"+_tmp[0];
					_tit = type.toUpperCase() + ((_tmp[0]=="abc") ? "解" : "加");
					_ret = this.mainExe(_fun)
					_flag = false;
				}
			} 
			if(_flag){
				_ret = this.mainExe(_fun);
				if(!_ret){
					_fun = "abc-"+type;
					_tit = type.toUpperCase()+"加";
					_ret = this.mainExe(_fun);
				}
			}
			_MAIN_["saveHistory"](_tit, _cls, _fun);
		} else {
			_ret = this.mainExe(type);
			_MAIN_["saveHistory"](type.toUpperCase(), "hash", type);
		}
		return _ret;
	},
	mainExe : function(type){
		var src = $("#"+_IN_).val();
		var other = $("#c").val();
		var _ret = ""; 
		switch (type) {
		case "md5" :
			_ret = CryptoJS.MD5(src);
			break;
		case "sha1" :
			_ret = CryptoJS.SHA1(src);
			break;
		case "abc-des" :
			_ret = CryptoJS.DES.encrypt(src,other);
			break;
		case "abc-aes" :
			_ret = CryptoJS.AES.encrypt(src,other);
			break;
		case "des-abc" :
			_ret = CryptoJS.DES.decrypt(src,other).toString(CryptoJS.enc.Utf8);
			break;
		case "aes-abc" :
			_ret = CryptoJS.AES.decrypt(src,other).toString(CryptoJS.enc.Utf8);
			break;
		case "abc-base64" :
			_ret = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(src));
			break;
		case "base64-abc" :
			try{
				_ret = CryptoJS.enc.Base64.parse(src).toString(CryptoJS.enc.Utf8);
			} catch(e){
				_ret = "";
			}
			break;
		}
		return _ret;
	}
};
_MAIN_["hash"] = hash;