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
    t: function(key, vars) {
        let s = this.data[key] || key;
        if (vars) {
            for (const k in vars) {
                s = String(s).split('{' + k + '}').join(vars[k]);
            }
        }
        return s;
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
        const a6 = document.getElementById("a6");
        if(a6) a6.innerHTML = this.t('so360') + '<span>[3]</span>';
        const a4 = document.getElementById("a4");
        if(a4) a4.innerHTML = this.t('yahoo') + '<span>[Y]</span>';
        const a5 = document.getElementById("a5");
        if(a5) a5.innerHTML = this.t('sogou') + '<span>[S]</span>';
        const a1 = document.getElementById("a1");
        if(a1) a1.innerHTML = this.t('baidu') + '<span>[D]</span>';

        const footCopy = document.getElementById("footCopy");
        if (footCopy) footCopy.textContent = this.t('copyright');
        document.querySelectorAll("#ufoot [data-i18n]").forEach(function (el) {
            el.textContent = i18n.t(el.getAttribute("data-i18n"));
        });

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
            inBookmarks.querySelectorAll("[data-i18n]").forEach(function(el) {
                el.textContent = i18n.t(el.getAttribute("data-i18n"));
            });
            const btn = inBookmarks.querySelector('button');
            if(btn) btn.textContent = this.t('cancel');
        }

        // 更新设置 / 皮肤面板
        this.updateSettings();
        this.updatePassPage();
        const keymapHint = document.querySelector(".keymap-hint");
        if (keymapHint) keymapHint.textContent = this.t("keymapHint");
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
        ["setting", "skin-panel"].forEach(function(id) {
            const panel = document.getElementById(id);
            if (!panel) return;
            panel.querySelectorAll("[data-i18n]").forEach(function(el) {
                el.textContent = i18n.t(el.getAttribute("data-i18n"));
            });
        });
        if (typeof updatePluginI18n === "function") {
            updatePluginI18n();
        }
        if (typeof syncGuestUi === "function") syncGuestUi();
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
        document.querySelectorAll(".title-toggle").forEach(el => {
            const hidden = el.classList.contains("on") || (el.closest && el.closest(".il.hidden"));
            const tip = hidden ? this.t('show') : this.t('hide');
            el.setAttribute('title', tip);
            el.setAttribute('aria-label', tip);
        });
        document.querySelectorAll(".title-edit").forEach(el => {
            el.setAttribute('title', this.t('edit'));
            el.setAttribute('aria-label', this.t('edit'));
        });
        document.querySelectorAll(".title-delete").forEach(el => {
            el.setAttribute('title', this.t('delete'));
            el.setAttribute('aria-label', this.t('delete'));
        });
        document.querySelectorAll(".title-up").forEach(el => {
            el.setAttribute('title', this.t('moveUp'));
            el.setAttribute('aria-label', this.t('moveUp'));
        });
        document.querySelectorAll(".title-down").forEach(el => {
            el.setAttribute('title', this.t('moveDown'));
            el.setAttribute('aria-label', this.t('moveDown'));
        });
    },

    // 更新密码管理页面
    updatePassPage: function() {
        document.querySelectorAll(".pass-page [data-i18n]").forEach(el => {
            el.textContent = this.t(el.getAttribute("data-i18n"));
        });
        document.querySelectorAll(".label-site-name").forEach(el => el.textContent = this.t('siteName'));
        document.querySelectorAll(".label-username").forEach(el => el.textContent = this.t('username'));
        document.querySelectorAll(".label-password").forEach(el => el.textContent = this.t('password'));
        document.querySelectorAll(".pass-back").forEach(el => el.textContent = this.t('back'));
        document.querySelectorAll(".btn-show-hide").forEach(el => el.textContent = this.t('showHide'));
        document.querySelectorAll(".pass-page .btn-delete").forEach(el => el.textContent = this.t('delete'));
        document.querySelectorAll(".pass-page .btn-add").forEach(el => el.textContent = this.t('addPassword'));
    }
};

// 切换语言函数
function switchLanguage() {
    let currentLang = i18n.currentLang;
    let newLang = currentLang === 'zh-CN' ? 'en-US' : 'zh-CN';
    i18n.switchLanguage(newLang);
}
