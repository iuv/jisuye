date = {
	exe : function(param){
		var _res = this.main(param);
		_MAIN_["sysPrint"](_OUT_,_res);
	},
	main : function(type){
		var _ret = "", _flag = true;
		var _map = {"u":"utc"};
		if(",u,".indexOf(type) >=0 ){
			var _fun = type+"-d",_cls = "date",_tit=_map[type]+"转日期";
			//如果有缓存的方法
			if(_MAIN_["_fun_"] && _MAIN_["_fun_"].split("-").length == 2){
				var _tmp = _MAIN_["_fun_"].split("-");
				if(_tmp[0] == type || _tmp[1] == type){
					_fun = _tmp[1]+"-"+_tmp[0];
					_tit = (_map[_tmp[1]] ? _map[_tmp[1]] : "日期转" ) + (_map[_tmp[0]] ? _map[_tmp[0]] : "转日期");
					_ret = this.mainExe(_fun)
					_flag = false;
				}
			} 
			if(_flag){
				_ret = this.mainExe(_fun);
				if(!_ret){
					_fun = "d-"+type;
					_tit = "日期转"+_map[type];
					_ret = this.mainExe(_fun);
				}
			}
			_MAIN_["saveHistory"](_tit, _cls, _fun);
		} else {
			_ret = this.mainExe(type);
		}
		return _ret;
	},
	mainExe : function(type){
		var src = $("#"+_IN_).val().split("\n")[0];
		var _ret = ""; 
		switch (type) {
		case "d-u" :
			var ds = src.split(" ");
			var y, m, d, h = 0, mm = 0, s = 0;
			var ds1 = ds[0].split("-");
			var ds1_1 = ds[0].split("/");
			if(ds1.length == 3){
				y = ds1[0];
				m = ds1[1]-1;
				d = ds1[2];
			}else if(ds1_1.length == 3){
				y = ds1_1[0];
				m = ds1_1[1]-1;
				d = ds1_1[2];
			} else {
				_ret = "请输入正确的日期 yyyy-MM-dd hh:mm:ss 或 yyyy/MM/dd hh:mm:ss";
			}
			if(ds.length >= 2){
				var ds2 = ds[1].split(":");
				if(ds2.length >= 2){
					h = ds2[0];
					mm = ds2[1];
					s = ds2[2] ? ds2[2] : 0;
				}
			}
			var tmp = new Date(y, m, d, h, mm, s, ds[2] ? ds[2] : 0);
			_ret = tmp.getTime();
			break;
		case "u-d" :
			var tmp = new Date(parseInt(src));
			if(isNaN(tmp.getMilliseconds())){
				_ret = "请输入正确UTC时间！";
			}else{
				var y = tmp.getFullYear();
				var m = this.za(tmp.getMonth()+1);
				var d = this.za(tmp.getDate());
				var h = this.za(tmp.getHours());
				var mm = this.za(tmp.getMinutes());
				var s = this.za(tmp.getSeconds());
				var ms = tmp.getMilliseconds();
				_ret = new Array(y, m, d).join("-")+" "+new Array(h,mm,s).join(":")+" "+ms;
			}
			break;
		}
		if(_OUT_ == "b"){
			var date = new Date();
			var Y = date.getUTCFullYear();
			var M = date.getUTCMonth();
			var D = date.getUTCDate();
			var H = date.getHours();
			var MI = date.getUTCMinutes();
			var S = date.getUTCSeconds();
			var SS = date.getUTCMilliseconds();
			//获取今天开始UTC
			_d = new Date(Y,M,D);
			_ret += "\n\n今天开始utc："+_d.getTime();
			//获取今天结束UTC
			_d = new Date(Y,M,D,"23","59","59","999");
			_ret += "\n\n今天结束utc："+ _d.getTime();
			//获取当前UTC
			_d = new Date();
			_ret += "\n\n当前utc："+_d.getTime();
		}
		return _ret;
	},
	za : function(v){
		return v<10 ? "0" + v : v;
	}
};
_MAIN_["date"] = date ;