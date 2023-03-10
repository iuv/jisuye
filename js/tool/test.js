function te(){
	alert(0);
}
if(typeof te != "undefined"){
	te();
} else {
	$.getScript("js/tool/test.js",function(){te()});
}