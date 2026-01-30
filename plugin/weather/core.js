weather = {
    // 初始化方法
    init : function (){
        let html = '<div id="weather1" style="position:absolute;top:10px;left:200px;width:370px;height:96px;z-index:999"></div>';
        html +='<div id="weather2" style="position:absolute;top:10px;left:200px;width:370px;overflow:hidden;opacity:0.5"><iframe allowtransparency="true" frameborder="0" width="385" height="96" scrolling="no" src="//tianqi.2345.com/plugin/widget/index.htm?s=2&z=1&t=0&v=0&d=3&bd=0&k=&f=&ltf=009944&htf=cc0000&q=1&e=0&a=1&c=54511&w=385&h=96&align=center"></iframe></div>';
        document.body.insertAdjacentHTML('beforeend', html);
        const weather1 = document.getElementById("weather1");
        if(weather1){
            weather1.addEventListener('dblclick', function() {
                const weather2 = document.getElementById("weather2");
                if(weather2){
                    // 切换显示/隐藏
                    if(weather2.style.display === 'none'){
                        weather2.style.display = '';
                    } else {
                        weather2.style.display = 'none';
                    }
                    // 显示时刷新天气
                    if(weather2.style.display !== 'none'){
                        const iframe = weather2.querySelector('iframe');
                        if(iframe){
                            iframe.src = iframe.src;
                        }
                    }
                }
            });
        }
    },
    // 销毁方法
    uninit : function (){
        const weather1 = document.getElementById("weather1");
        const weather2 = document.getElementById("weather2");
        if(weather1 && weather1.parentNode){
            weather1.parentNode.removeChild(weather1);
        }
        if(weather2 && weather2.parentNode){
            weather2.parentNode.removeChild(weather2);
        }
    }
};
PLFUN["weather"] = weather;