// 缓存密码管理密码
var passPass="";
// 显示密码管理
function showPass(){
    let txt = "请输入密码管理工具的密码！";
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
            txt = "密码错误！请重新输入!";
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
    ixx.mount('#ubody')
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