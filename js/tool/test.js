// 原生加载脚本
function loadScript(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    script.onerror = () => console.error('Failed to load script:', url);
    document.head.appendChild(script);
}

function te(){
	alert(0);
}
if(typeof te != "undefined"){
	te();
} else {
	loadScript("js/tool/test.js",function(){te()});
}
