/**
主文件，预判要执行的操作，引入对应js文件，执行方法
**/
var _MAIN_={};//全局变量，存放引入的js对象
var _IN_ = "a";//默认的入参文本域id
var _OUT_ = "b";//默认的出参文本域id
var _TIT_ = "";//猜你想要的按钮title
var _CLS_ = "";//猜你想要的类
var _FUN_ = "";//猜你想要的方法 （如果缓存中有，还按列表中的按钮说明ai判断错误，则转换方法，如缓存中是u8-n,这是再触发u8则执行n-u8方法）

// 页面加载时初始化国际化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof i18n !== 'undefined') {
            i18n.init();
            updateToolPageI18n();
        }
    });
} else {
    if (typeof i18n !== 'undefined') {
        i18n.init();
        updateToolPageI18n();
    }
}

// 更新工具页国际化文本
function updateToolPageI18n() {
    // 更新标题
    document.title = i18n.t('pageTitle') + ' - ' + i18n.t('other');
    const toolPageTitle = document.getElementById("toolPageTitle");
    if(toolPageTitle) toolPageTitle.textContent = i18n.t('pageTitle') + ' - ' + i18n.t('other');

    // 更新输入区域
    document.querySelectorAll(".t_title").forEach(el => el.textContent = i18n.t('input'));
    document.querySelectorAll(".t_extxt label").forEach(el => el.textContent = i18n.t('additional'));
    const c = document.getElementById("c");
    if(c) c.setAttribute('placeholder', i18n.t('additionalTip'));

    // 更新按钮区域分类标题
    document.querySelectorAll(".t_but_type").forEach((el, idx) => {
        if (idx === 0) {
            const first = el.querySelector("span:first-child");
            if(first) first.textContent = i18n.t('format');
        }
    });
    document.querySelectorAll(".t_but_type_2").forEach(el => {
        const first = el.querySelector("span:first-child");
        if(first) first.textContent = i18n.t('encryptDecrypt');
    });
    const tButType3 = document.querySelector(".t_but_type:nth-child(3)");
    if(tButType3){
        const first = tButType3.querySelector("span:first-child");
        if(first) first.textContent = i18n.t('encodeConvert');
    }
    const tButTypeLast = document.querySelector(".t_but_type:last-child");
    if(tButTypeLast){
        const first = tButTypeLast.querySelector("span:first-child");
        if(first) first.textContent = i18n.t('other');
    }

    // 更新具体按钮文本
    updateButtonText(".t_but_type", [
        {sel: "nth-child(3)", key: "jsonFormat"},
        {sel: "nth-child(4)", key: "xmlFormat"},
        {sel: "nth-child(5)", key: "cssFormat"},
        {sel: "nth-child(6)", key: "sqlFormat"}
    ]);

    updateButtonText(".t_but_type_2", [
        {sel: "nth-child(3)", key: "sha1"},
        {sel: "nth-child(4)", key: "md5"},
        {sel: "nth-child(5)", key: "des"},
        {sel: "nth-child(6)", key: "aes"},
        {sel: "nth-child(7)", key: "base64"}
    ]);

    updateButtonText(".t_but_type:nth-child(3)", [
        {sel: "nth-child(3)", key: "nativeUtf8"},
        {sel: "nth-child(4)", key: "nativeAscii"},
        {sel: "nth-child(5)", key: "urlEncode"},
        {sel: "nth-child(6)", key: "urlDecode"}
    ]);

    const tButTypeLast3 = document.querySelector(".t_but_type:last-child span:nth-child(3) button");
    if(tButTypeLast3) tButTypeLast3.textContent = i18n.t('utcDate');

    // 更新语言切换按钮
    const langSwitchBtn = document.querySelector("#langSwitch button");
    if(langSwitchBtn) langSwitchBtn.textContent = i18n.t('language');
}

// 辅助函数：更新按钮文本
function updateButtonText(parentSelector, configs) {
    const parent = document.querySelector(parentSelector);
    if (!parent) return;
    configs.forEach(config => {
        const btn = parent.querySelector("span:" + config.sel + " button");
        if (btn) btn.textContent = i18n.t(config.key);
    });
}

// 切换工具页语言
function switchToolLanguage() {
    let currentLang = i18n.currentLang;
    let newLang = currentLang === 'zh-CN' ? 'en-US' : 'zh-CN';
    // 直接加载语言包并更新工具页
    i18n.loadLanguage(newLang);
    // 手动调用工具页更新
    updateToolPageI18n();
}

function run(cls,fun){
	//清空猜你想要
	guessYouWant("clear");
	_IN_ = "a";
	_OUT_ = "b";
	//如果输入为空并且不是时间和ip则不处理
	const inputEl = document.getElementById(_IN_);
	if(!inputEl || (!inputEl.value && ",date,ip,".indexOf(cls) < 0)){
		return;
	}
	codeHander(cls, fun);
	if(_MAIN_[cls]){
		_MAIN_[cls]["exe"](fun);
	} else {
		const script = document.createElement('script');
		script.src = "js/tool/"+cls+".js?v170724";
		script.onload = function(){_MAIN_[cls]["exe"](fun);};
		document.head.appendChild(script);
	}

}
//判断是否为代码（高亮）
function codeHander(cls, fun){
	const t_out = document.querySelector(".t_out");
	if(!t_out) return;

	var _baseh = t_out.clientHeight;
	var _basew = t_out.clientWidth;
	if("JsonFormat,format".indexOf(cls) >= 0 && cls){
		var _height = _baseh-21;
		var _width = _basew-54;
		t_out.innerHTML = "<div class='t_title'>输出</div><pre class='language-"+(fun ? (fun == "xml" ? "markup" : fun) : "json")+"' style='height:"+_height+"px;width:"+_width+"px'></pre>";
	} else if(cls == "qrcode"){
		var _height = _baseh-21;
		var _width = _basew;
		t_out.innerHTML = "<div class='t_title'>输出</div><div id='qcode' style='height:"+_height+"px;width:"+_width+"px'></div>";
	} else {
		var _height = _baseh-24;
		var _width = _basew;
		t_out.innerHTML = "<div class='t_title'>输出</div><textarea class='t_txt' id='b' style='height:"+_height+"px;width:"+_width+"px'></textarea>";
	}
}
//重复操作
function repeat(){
	//如果输入为空并且不是时间和ip则不处理
	const el = document.getElementById(_IN_);
	if(!el || (!el.value && ",date,ip,".indexOf(_CLS_) < 0)){
		return;
	}
	_IN_ = "a";
	_OUT_ = "b";
	_MAIN_[_CLS_]["exe"](_FUN_);
}
//反向操作
function reverse(){
	_IN_ = "b";
	_OUT_ = "a";
	_tmp = _FUN_.split("-");
	_MAIN_[_CLS_]["exe"](_tmp[1]+"-"+_tmp[0]);
}
//判断输入
document.onkeyup = function onkup(event){
	target = document.activeElement;
	var e = event || window.event || arguments.callee.caller.arguments[0];
	if (e) {
		if (e.keyCode==27) {//按的是esc
				if(target != null && (target.tagName == "INPUT" || target.tagName=="TEXTAREA")){//如果焦点在输入框中,移出焦点
				const el = document.getElementById(target.id);
				if(el) el.blur();
			} else {//不在的话关闭工具页面
				parent.close(parent.toolViewFlag);
			}
			return;
		} else if(target != null && (target.tagName != "INPUT" && target.tagName!="TEXTAREA")){
			var _c = String.fromCharCode(e.keyCode);
			switch (_c) {
			case "I": const elA = document.getElementById("a"); if(elA) elA.focus(); break;//输入
			case "O": const elB = document.getElementById("b"); if(elB) elB.focus(); break;//输出
			case "F": const elC = document.getElementById("c"); if(elC) elC.focus(); break;//附加
			}
		}
	}
}
//判断输入
function inputAi(event){
	const elA = document.getElementById("a");
	var a = elA ? elA.value : "";
	var v = a.trim();
	var b_tit,b_cls,b_fun;
	if(v.length > 2 && (v.replace(/\n*\s*/g,"").substr(0,2) == "{\"" || v.replace(/\n*\s*/g,"").substr(0,2) == "[{")){
		b_tit = 'json格式化';
		b_cls = 'JsonFormat';
	} else if (/\\u[0-9a-fA-F]{4}/.test(v)){
		b_tit = 'ASCIIToNative';
		b_cls = 'encode';
		b_fun = 'a-n';
	} else if (/\&#x[0-9a-fA-F]{4}/.test(v)){
		b_tit = 'Utf8转Native';
		b_cls = 'encode';
		b_fun = 'u8-n';
	} else if (/^[0-9]{13}$/.test(v)){
		b_tit = 'utc转日期';
		b_cls = 'date';
		b_fun = 'u-d';
	} else if (/^[0-9]{4}[-/\/][0-9]{1,2}[-/\/][0-9]{1,2}( [0-9]{1,2}:[0-9]{1,2}(:[0-9]{1,2})?( [0-9]{1,3})?)?$/.test(v)){
		b_tit = '日期转utc';
		b_cls = 'date';
		b_fun = 'd-u';
	} else if (/[0-9a-zA-Z].=+$/.test(v)){
		b_tit = 'BASE64解';
		b_cls = 'hash';
		b_fun = 'base64-abc';
	} else if (/^<[\s\S]*>$/.test(v)){
		b_tit = 'xml格式化';
		b_cls = 'format';
		b_fun = 'xml';
	} else if (/.*\{.*\}$/.test(v)){
		b_tit = 'css格式化';
		b_cls = 'format';
		b_fun = 'css';
	} else if (",select,delete,update,install,".indexOf(","+v.split(" ")[0].toLowerCase()+",")>=0){
		b_tit = 'sql格式化';
		b_cls = 'format';
		b_fun = 'sql';
	} else if (/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/.test(v)){
		if(a.charAt(a.length-1) == "\n"){
			b_tit = 'IP地址解析';
			b_cls = 'ip';
		}
	}
	if(b_tit){//如果Ai判断出操作则执行ai判断结果
		guessYouWant(b_tit,b_cls,b_fun,1);
	} else if(_TIT_){//否则如果有历史（手动点击）则按历史处理（不需要记录历史的可在具体方法中清空历史）
		guessYouWant(_TIT_,_CLS_,_FUN_,1);
	} else {//否则   清空输出  及 猜你喜欢
		guessYouWant("clear");
		codeHander("");
	}
	
}
/** 猜你想要 */
function guessYouWant(b_tit,b_cls,b_fun,flag){
	var pv = "";
	if(b_tit != "clear"){
		if(b_tit){
			pv = "<button  onclick=\"repeat()\">"+b_tit+"</button>";
			if(b_cls && flag){
				run(b_cls, b_fun);
			}
		}
	}
	const t_ai = document.getElementById("t_ai");
	if(pv){
		var _tmp = flag ? "猜你想要" : "当前执行";
		if(t_ai) t_ai.innerHTML = _tmp + "：<br/><br/>"+pv;
	} else {
		if(t_ai) t_ai.innerHTML = "";
		sysPrint("b","");
	}

	const t_panel = document.getElementById("t_panel");
	if(_FUN_ && _FUN_.indexOf("-") > 0){
		if(t_panel) t_panel.style.display = "block";
	} else {
		if(t_panel) t_panel.style.display = "none";
	}
}
//统一输出
function sysPrint(id, txt, type){
	if(!type){
		const el = document.getElementById(id);
		if(el) el.value = txt;
	} else if("json,xml,css,sql".indexOf(type) >= 0){
		const pre = document.querySelector(".t_out>pre");
		if(pre) pre.innerHTML = "<code class='line-numbers-rows language-"+(type == "xml" ? "markup" : type)+"'>"+txt+"</code>";
		if(self.Prism && self.Prism.highlightAll) self.Prism.highlightAll(event);//刷新高亮
	}
	if(type!="qrcode" && txt ){
		if(document.querySelectorAll(".cpbtn").length == 0){
			const tTitle1 = document.querySelector(".t_title:nth-child(2)");
			if(tTitle1){
				tTitle1.insertAdjacentHTML('beforeend', "<button class='cpbtn' style='margin-left:20px;' data-clipboard-text=''>复制</button><span id='tipp' style='color:green;display:none;'>&nbsp;&nbsp;复制成功！</span>");
			}
		} else {
			document.querySelectorAll(".cpbtn").forEach(el => el.remove());
		}
	}
	//刷新复制按钮
	document.querySelectorAll(".cpbtn").forEach(el => el.setAttribute("data-clipboard-text", txt));
}
function saveHistory(tit, cls, fun){
	_TIT_ = tit;
	_CLS_ = cls;
	_FUN_ = fun;
	guessYouWant(_TIT_,_CLS_,_FUN_);
	_MAIN_["_fun_"] = fun;
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){
        initAllTool();
    });
} else {
    initAllTool();
}

function initAllTool(){
    _MAIN_["sysPrint"] = sysPrint;
    _MAIN_["guessYouWant"] = guessYouWant;
    _MAIN_["saveHistory"] = saveHistory;
    _MAIN_["_fun_"] = "";//缓存方法

    const elA = document.getElementById("a");
    const elB = document.getElementById("b");
    if(elA && elA.parentNode){
        elA.style.width = elA.parentNode.clientWidth + "px";
        elA.style.height = elA.parentNode.clientHeight + "px";
    }
    if(elB && elB.parentNode){
        elB.style.width = elB.parentNode.clientWidth + "px";
        elB.style.height = "600px";
    }
    if(elA) elA.focus();
    if(elA) elA.addEventListener("keyup", inputAi);
    //判断是否有首页Ai判断出的类型
    if(parent  && parent._TXT_){
        if(elA) elA.value = parent._TXT_;
        if(parent._CLS_){
            guessYouWant(parent._TIT_,parent._CLS_,parent._FUN_,1);
        }
        //清空
        parent._CLS_ = "";
        parent._FUN_ = "";
        parent._TXT_ = "";
        parent._TIT_ = "";
    }
}
