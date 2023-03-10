JsonFormat = {
	e : false,
	exe : function(){
		e = false;
		var _t = this.main();
		if(e){
			_t = "结尾处json格式有误:\n"+_t;
		}
		_MAIN_["sysPrint"]("",_t,"json");
		_MAIN_["saveHistory"]("json格式化","jsonFormat", "");
	},

	main : function(){
		var t = [];//符号堆栈
		var bi = 0; //格式输出缩进级别
		var n = "\n";//换行
		var txt = "";//输出 
		var lc = "";//最后一个字符
		var lf = ":";//记录最后一个符号（只记录逗号或冒号）
		var a = $("#"+_IN_).val().trim();
		var flag = false;//是否有“:”号
		if(a.replace(/\n*\s*/g,"").substr(0,2) != "{\"" && a.replace(/\n*\s*/g,"").substr(0,2) != "[{"){
			e = true;//error
			return a[0] == "{" ? "{" : "";
		}
		for(var i = 0; i<a.length; i++){
			_v = a[i];
			if("{}[]\",:\n ".indexOf(_v)>=0){
			switch(_v){
				case '{' : 
					if(!this.isChar(t,"\"")){
						if((t.length == 0 && txt == "") || ":[".indexOf(this.lastChar(txt))>=0 || ("," == this.lastChar(txt) && this.isChar(t,"["))){
							lc = _v;
							lf = _v;
							t.push(_v);
							txt += _v + n + this.b(++bi);
						} else {
							e = true;//error
							return txt;
						}
					} else {
						txt += _v;
					}
					break;
				case '}' : 
					if(!this.isChar(t,"\"")){
						_tmp = t.pop();
						lc = _v;
						if("{"==_tmp){
							if(("\"]{}".indexOf(this.lastChar(txt)) >=0 || this.lastWordIsRight(txt)) && flag){
								txt += n + this.b(--bi) + _v;
							} else {
								e = true;//error
								return txt;
							}
						} else {
							e = true;//error
							return txt;
						}
					} else {
						txt += _v;
					}
					break;
				case '"' : 
					if(this.isChar(t,"\"") ){
						if(this.lastIsNotBs(txt)){
							lc = _v;
							t.pop();
						}
						txt += _v;
						bs = 0;
					} else {
						if((this.isChar(t,"{") || this.isChar(t,"[")) && ",:{[".indexOf(lc)>=0){
							lc = _v;
							t.push(_v);
							txt += _v;
						}else{
							e = true;
							return txt;
						}
					}
					break;
				case ',' : 
					if(!this.isChar(t,"\"")) {
						if("]}\"".indexOf(lc)>=0 || this.lastWordIsRight(txt)){
							if(lf == ":" || this.isChar(t,"[") || lc == "}"){
								lc = _v;
								lf = _v;//记录最后一个符号（只记录逗号或冒号）
								txt += _v + n + this.b(bi);
							} else {
								e = true;//error
								return txt;
							}
						} else {
							e = true;
							return txt;
						}
					} else {
						txt += _v;
					}
					break;
				case '[' : 
					if(!this.isChar(t,"\"")){
						if(":{[".indexOf(this.lastChar(txt))>=0 || ("," == this.lastChar(txt) && this.isChar(t,"["))){
							lc = _v;
							t.push(_v);
							txt += _v + n + this.b(++bi);
						} else {
							e = true;//error
							return txt;
						}
					} else {
						txt += _v;
					}
					break;
				case ']' : 
					if(!this.isChar(t,"\"")){
						lc = _v;
						_tmp = t.pop();
						if("["==_tmp && ("\"}][".indexOf(this.lastChar(txt)) >=0 || this.lastWordIsRight(txt))){
							txt += n + this.b(--bi) + _v;
							lf = ":";
						} else {
							e = true;//error
							return txt;
						}
					} else {
						txt += _v;
					}
					break;
				case ':' : 
					if(!this.isChar(t,"\"")){
						if(this.lastChar(txt) == "\"" && !this.isChar(t,"[")){
							if(lf != ":"){
								lc = _v;
								lf = _v;
								flag = true;
								txt += _v;
							} else {
								e = true;//error
								return txt;
							}
						} else {
							e = true;//error
							return txt;
						}
					} else {
						txt += _v;
					}
					break;
				case ' ' : 
					if(this.isChar(t,"\"")){
						txt += _v;
					}
					break;
				case '\n' : 
					if(this.isChar(t,"\"")){
						e = true;//error
						return txt;
					}
					break;
			}
			} else {
				if(this.isChar(t,"\"") || (t.length >0 && ",[:".indexOf(lc)>=0)){
					txt += _v;
				} else {
					e = true;//error
					return txt;
				}
			}
		}
		if(t.length != 0){
			e = true;//error
		}
		return txt;
	},
	//返回i长度的缩进
	b: function(i){
		var _ret = "";
		while(i>0){
			_ret += "    ";
			i--;
		}
		return _ret;
	},
	//判断堆栈最后一个是不是c字符
	isChar: function(t,c){
		if(t.length > 0){
			var _pop = t.pop();
			t.push(_pop);
			return _pop == c;
		} else {
			return false;
		}
	},

	//返回行尾是不是反斜杠
	lastIsNotBs: function(txt){
		var _ret = 0;
		for( var i = txt.length -1; i>=0; i--){
			if(txt.charAt(i) == "\\"){
				_ret ++;
			} else {
				break;
			}
		}
		return _ret % 2 == 0;
	},
	//返回最后一个字符
	lastChar:function(txt){
		var _tmp = txt.trim();
		return _tmp ? _tmp.charAt(_tmp.length - 1) : "";
	},
	//返回最后一个单词是不是数字
	lastWordIsRight:function(txt){
		var _l = txt.lastIndexOf(":") > txt.lastIndexOf(",") ? txt.lastIndexOf(":") : txt.lastIndexOf(",");
		var _b = false;
		_l = txt.lastIndexOf("[") > _l ? txt.lastIndexOf("[") : _l;
		var _tmp = txt.substring( _l + 1 , txt.length);
		var z = eval("/^-?(0|0\.[0-9]+|[1-9][0-9]*\.?[0-9]+|[1-9])$/i");
		_b = z.test(_tmp.trim());
		if(!_b){
			_b = ",null,true,false,".indexOf(","+_tmp.trim()+",") >= 0;
		}
		return _b;
	},
	//返回最后一个出现的是冒号还是逗号
	lastSymbol:function(txt){
		if(txt.lastIndexOf(":") == txt.lastIndexOf(",")){
			return ":";
		} else {
			return txt.lastIndexOf(":") > txt.lastIndexOf(",") ? ":" : ",";
		}
	}
};
_MAIN_["JsonFormat"] = JsonFormat;