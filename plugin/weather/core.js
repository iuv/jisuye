weather = {
    // 初始化方法
    init : function (){
        let html = '<div id="weather1" style="position:absolute;top:10px;left:200px;width:370px;height:96px;z-index:999"></div>';
        html +='<div id="weather2" style="position:absolute;top:10px;left:200px;width:370px;overflow:hidden;opacity:0.5"><iframe allowtransparency="true" frameborder="0" width="385" height="96" scrolling="no" src="//tianqi.2345.com/plugin/widget/index.htm?s=2&z=1&t=0&v=0&d=3&bd=0&k=&f=&ltf=009944&htf=cc0000&q=1&e=0&a=1&c=54511&w=385&h=96&align=center"></iframe></div>';
        document.body.insertAdjacentHTML('beforeend', html);
        $("#weather1").dblclick(function() {
            $('#weather2').toggle();
        });
    },
    // 销毁方法
    uninit : function (){
        $("#weather1").remove();
        $("#weather2").remove();
    }
};
PLFUN["weather"] = weather;