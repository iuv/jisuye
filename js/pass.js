// 缓存密码管理密码
var passPass="";
// 显示密码管理
async function showPass(){
    if (!json) return;
    let txt = i18n.t('promptPassword');
    const maxRetry = typeof MAX_PASS_RETRY === 'number' ? MAX_PASS_RETRY : 5;
    for (let i = 0; i < maxRetry; i++) {
        if(!passPass){
            passPass = await showPrompt({
                type: "password",
                title: i18n.t("passPromptTitle"),
                message: txt
            });
            if(!passPass){
                return;
            }
        }
        try {
            if(json.passList){
                var decrypted = CryptoJS.AES.decrypt(json.passList, passPass);
                var plain = decrypted.toString(CryptoJS.enc.Utf8);
                if(!plain) throw new Error('empty');
                passList = JSON.parse(unzip(plain));
            } else if(!passList){
                passList = [];
            }
            editPass();
            return;
        } catch (error) {
            passPass="";
            txt = i18n.t('passwordErrorRetry', { n: i + 1, max: maxRetry });
        }
    }
    if (typeof showTip === 'function') {
        showTip(i18n.t('passwordRetryLimit'));
    } else {
        window.alert(i18n.t('passwordRetryLimit'));
    }
}
// 渲染passList
function editPass(){
    unmountApp();
    ixx = Vue.createApp({
        data(){
            return {"passList": passList};
        },
        template: "#pass"
    });
    ixx.mount('#ubody');
    appView = 'pass';
    if (typeof setUbodyView === "function") setUbodyView("pass");
    if (typeof i18n !== 'undefined') {
        i18n.updatePassPage();
    }
}
// 显示、隐藏密码
function showHide(t){
   let wrap = t.closest(".pass-pw") || t.parentNode;
   let ipt = wrap.querySelector("input");
   if(!ipt) return;
   let type = (ipt.getAttribute("type") == "password" ? "text" : "password");
   ipt.setAttribute("type", type);
}
// 保存新密码记录
function addPass(){
    let ipts = document.querySelectorAll("#addPass input");
    let t = ipts[0].value;
    let n = ipts[1].value;
    let p = ipts[2].value;
    passList.push({t: t, n: n, p: p});
    editPass();
}
// 删除密码记录
function delPass(idx){
    passList.splice(idx,1);
    editPass();
}
