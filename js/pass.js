// 缓存密码管理密码
var passPass="";
// 显示密码管理
function showPass(){
    let txt = i18n.t('promptPassword');
    let tmpPass
    while(true){
        if(!passPass){
            passPass = window.prompt(txt);
            if(!passPass){
                return;
            }
        }
        // 解密数据
        try {
            if(json.passList){
                var decrypted = CryptoJS.AES.decrypt(json.passList, passPass);
                passList = decrypted.toString(CryptoJS.enc.Utf8);
                passList = unzip(passList);
                passList = JSON.parse(passList);
            } else if(!passList){
                passList = [];
            }
        } catch (error) {
            passPass="";
            txt = i18n.t('passwordError');
            continue;
        }
        break;
    }
    editPass();
}
// 渲染passList
function editPass(){
    // 解析数据显示
    ixx.unmount();
    const { createApp } = Vue
    ixx= createApp({
        data(){
            return {"passList": passList};
        },
        template: "#pass"
    });
    ixx.mount('#ubody');
    // 更新国际化文本
    if (typeof i18n !== 'undefined') {
        i18n.updatePassPage();
    }
}
// 显示、隐藏密码
function showHide(t){
   let v = $(t).parent()[0];
   let ipt = $(v).find("input")[2];
   let type = ($(ipt).attr("type") == "password" ? "text" : "password")
   $(ipt).attr("type", type);
}
// 保存新密码记录
function addPass(){
    let ipts = $("#addPass input");
    let t = $(ipts[0]).val();
    let n = $(ipts[1]).val();
    let p = $(ipts[2]).val();
    passList.push({t: t, n: n, p: p});
    editPass();
}
// 删除密码记录
function delPass(idx){
    passList.splice(idx,1);
    editPass();
}