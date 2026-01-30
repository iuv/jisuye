// 国际化管理模块
var i18n = {
    currentLang: 'zh-CN',
    data: {},
    
    // 初始化国际化
    init: function() {
        // 从localStorage获取语言设置
        let savedLang = localStorage.getItem('jisuye_lang');
        if (savedLang) {
            this.currentLang = savedLang;
        } else {
            // 自动检测浏览器语言
            let browserLang = navigator.language || navigator.userLanguage;
            if (browserLang && browserLang.startsWith('en')) {
                this.currentLang = 'en-US';
            }
        }
        
        // 加载对应语言包
        this.loadLanguage(this.currentLang);
    },
    
    // 加载语言包
    loadLanguage: function(lang) {
        if (lang === 'zh-CN') {
            this.data = zh_CN;
        } else if (lang === 'en-US') {
            this.data = en_US;
        } else {
            // 默认使用中文
            this.data = zh_CN;
        }
        this.currentLang = lang;
        // 只在主页（index.html）调用 updatePage，并确保 DOM 已加载
        if (document.readyState === 'complete') {
            const ubody = document.getElementById("ubody");
            if (ubody) {
                this.updatePage();
            }
        } else {
            // 如果 DOM 还没加载完成，等待加载完成后再更新
            var that = this;
            document.addEventListener('DOMContentLoaded', function() {
                const ubody = document.getElementById("ubody");
                if (ubody) {
                    that.updatePage();
                }
            });
        }
        localStorage.setItem('jisuye_lang', lang);
    },
    
    // 切换语言
    switchLanguage: function(lang) {
        if (lang !== this.currentLang) {
            this.loadLanguage(lang);
        }
    },
    
    // 获取翻译文本
    t: function(key) {
        return this.data[key] || key;
    },
    
    // 更新页面文本
    updatePage: function() {
        // 更新标题
        document.title = this.t('pageTitle');

        // 更新搜索引擎名称
        const a3 = document.getElementById("a3");
        if(a3) a3.innerHTML = this.t('bing') + '<span>[B]</span>';
        const a2 = document.getElementById("a2");
        if(a2) a2.innerHTML = this.t('google') + '<span>[G]</span>';
        const a7 = document.getElementById("a7");
        if(a7) a7.innerHTML = this.t('github') + '<span>[H]</span>';
        const a9 = document.getElementById("a9");
        if(a9) a9.innerHTML = this.t('linux') + '<span>[L]</span>';
        const a6 = document.getElementById("a6");
        if(a6) a6.innerHTML = this.t('so360') + '<span>[3]</span>';
        const a4 = document.getElementById("a4");
        if(a4) a4.innerHTML = this.t('yahoo') + '<span>[Y]</span>';
        const a5 = document.getElementById("a5");
        if(a5) a5.innerHTML = this.t('sogou') + '<span>[S]</span>';
        const a1 = document.getElementById("a1");
        if(a1) a1.innerHTML = this.t('baidu') + '<span>[D]</span>';

        // 更新底部设置 - 保留原有结构，只更新文本
        const ufoot = document.getElementById("ufoot");
        if(ufoot && ufoot.firstChild) {
            ufoot.firstChild.nodeValue = this.t('copyright');
        }

        // 更新代理选项文本
        const proxy = document.getElementById("proxy");
        if(proxy){
            const options = proxy.querySelectorAll("option");
            if(options[0]) options[0].textContent = this.t('proxyNone');
            if(options[1]) options[1].textContent = this.t('proxy1');
            if(options[2]) options[2].textContent = this.t('proxy2');
            if(options[options.length-1]) options[options.length-1].textContent = this.t('proxyCustom');
        }

        // 确保语言切换链接存在
        if (!document.getElementById("langSwitch") && proxy) {
            const langSwitch = document.createElement("span");
            langSwitch.id = "langSwitch";
            langSwitch.innerHTML = '<a href="javascript:switchLanguage();"></a>';
            if(proxy.parentNode) proxy.parentNode.after(langSwitch);
        }
        const langSwitchA = document.querySelector("#langSwitch a");
        if(langSwitchA) langSwitchA.textContent = this.t('language');

        // 恢复代理选择
        this.restoreProxy();

        // 更新登录区域
        const login = document.getElementById("login");
        if (login) {
            // 先保存当前显示状态
            let isVisible = login.style.display !== 'none';

            // 只更新内部文本内容，不替换整个HTML结构
            const links = login.querySelectorAll("a");
            links.forEach(function(link) {
                let href = link.getAttribute('href');
                if (href && href.indexOf('editData') >= 0) {
                    link.textContent = i18n.t('showEdit');
                } else if (href && href.indexOf('setting') >= 0) {
                    link.textContent = i18n.t('settings');
                } else if (href && href.indexOf('showPass') >= 0) {
                    link.textContent = i18n.t('passwordSecurity');
                } else if (link.getAttribute('id') === 'copyAndCommit') {
                    link.textContent = i18n.t('copyAndCommit');
                }
            });

            // 如果原来不可见，则恢复隐藏状态
            if (!isVisible) {
                login.style.display = "none";
            }
        }

        // 更新编辑表单文本
        this.updateEditForm();

        // 更新源码&帮助 - 使用 ID 直接查找
        const sourceHelp = document.getElementById("sourceAndHelp");
        if(sourceHelp) sourceHelp.innerHTML = this.t('sourceAndHelp');

        // 更新导入收藏
        const inBookmarks = document.getElementById("inBookmarks");
        if (inBookmarks) {
            const btn = inBookmarks.querySelector('button');
            if(btn) btn.textContent = this.t('cancel');
        }

        // 更新设置面板
        this.updateSettings();
    },
    
    // 恢复代理选择
    restoreProxy: function() {
        let proxy = Cookies.get("proxy");
        if (!proxy) {
            return;
        }

        let proxyList = ["https://ghproxy.com/", "https://gh.api.99988866.xyz/"];
        let select = document.getElementById("proxy");
        if(!select) return;

        // 检查是否已经有代理选项，如果没有则添加
        let hasProxyOptions = false;
        const options = select.querySelectorAll("option");
        options.forEach(function(option) {
            let val = option.value;
            if (val && val !== "0" && val !== "") {
                hasProxyOptions = true;
                return;
            }
        });

        if (!hasProxyOptions) {
            // 添加代理选项，使用国际化文本
            for (let i = 0; i < proxyList.length; i++) {
                let ptmp = proxyList[i];
                let proxyKey = 'proxy' + (i + 1);
                let option = document.createElement("option");
                option.value = ptmp;
                option.textContent = this.t(proxyKey);
                if (ptmp == proxy) option.selected = true;
                select.appendChild(option);
            }
            // 添加自定义选项
            const customOption = document.createElement("option");
            customOption.value = "0";
            customOption.textContent = this.t('proxyCustom');
            select.appendChild(customOption);
        }

        // 更新现有代理选项的文本（国际化切换时需要）
        select.querySelectorAll("option").forEach(function(option) {
            let val = option.value;
            if (val && val !== "0" && val !== "") {
                for (let i = 0; i < proxyList.length; i++) {
                    if (val === proxyList[i]) {
                        option.textContent = i18n.t('proxy' + (i + 1));
                        break;
                    }
                }
            }
        });

        // 设置选中值
        select.value = proxy;
    },
    
    // 更新设置面板
    updateSettings: function() {
        const setting = document.getElementById("setting");
        if (setting) {
            const div1 = setting.querySelector("div:nth-child(1)");
            if(div1){
                const div1First = div1.querySelector("div:first-child");
                if(div1First) div1First.textContent = this.t('basicSettings');

                // 更新设置链接文本
                const div1Second = div1.querySelector("div:nth-child(2)");
                if(div1Second){
                    const links = div1Second.querySelectorAll("a");
                    if (links.length >= 3) {
                        if(links[0]) links[0].textContent = this.t('setPassword');
                        if(links[1]) links[1].textContent = this.t('logout');
                        if(links[2]) links[2].textContent = this.t('importBookmarks');
                    }
                }
            }

            const div2 = setting.querySelector("div:nth-child(2)");
            if(div2){
                const div2First = div2.querySelector("div:first-child");
                if(div2First) div2First.textContent = this.t('pluginSettings');
            }

            const settingBtn = setting.querySelector("button");
            if(settingBtn) settingBtn.textContent = this.t('close');

            // 更新插件国际化文本
            if (typeof updatePluginI18n === 'function') {
                updatePluginI18n();
            }
        }
    },
    
    // 更新编辑表单文本
    updateEditForm: function() {
        // 更新标签文本
        document.querySelectorAll(".label-name").forEach(el => el.textContent = this.t('name') + '：');
        document.querySelectorAll(".label-url").forEach(el => el.textContent = this.t('url') + '：');
        document.querySelectorAll(".label-color").forEach(el => el.textContent = this.t('color') + '：');
        document.querySelectorAll(".label-shortcut").forEach(el => el.textContent = this.t('shortcut') + '：');
        document.querySelectorAll(".label-category").forEach(el => el.textContent = this.t('category') + '：');

        // 更新按钮文本
        document.querySelectorAll(".btn-save").forEach(el => el.textContent = this.t('save'));
        document.querySelectorAll(".btn-close").forEach(el => el.textContent = this.t('close'));
        document.querySelectorAll(".btn-add-link").forEach(el => el.textContent = this.t('addLink'));
        document.querySelectorAll(".btn-add-group").forEach(el => el.textContent = this.t('addGroup'));

        // 更新按钮 title 属性
        document.querySelectorAll(".title-toggle").forEach(el => el.setAttribute('title', this.t('toggleView')));
        document.querySelectorAll(".title-edit").forEach(el => el.setAttribute('title', this.t('edit')));
        document.querySelectorAll(".title-delete").forEach(el => el.setAttribute('title', this.t('delete')));
    },

    // 更新密码管理页面
    updatePassPage: function() {
        // 更新标签文本
        document.querySelectorAll(".label-site-name").forEach(el => el.textContent = this.t('siteName') + ':');
        document.querySelectorAll(".label-username").forEach(el => el.textContent = this.t('username') + ':');
        document.querySelectorAll(".label-password").forEach(el => el.textContent = this.t('password') + '：');

        // 更新按钮文本
        document.querySelectorAll(".btn-show-hide").forEach(el => el.textContent = this.t('showHide'));
        document.querySelectorAll(".btn-delete").forEach(el => el.textContent = this.t('delete'));
        document.querySelectorAll(".btn-add").forEach(el => el.textContent = this.t('addPassword'));
    }
};

// 切换语言函数
function switchLanguage() {
    let currentLang = i18n.currentLang;
    let newLang = currentLang === 'zh-CN' ? 'en-US' : 'zh-CN';
    i18n.switchLanguage(newLang);
}
