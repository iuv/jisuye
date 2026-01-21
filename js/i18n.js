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
        // 只在主页（index.html）调用 updatePage
        if ($("#ubody").length > 0) {
            this.updatePage();
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
        $("#a3").html(this.t('bing') + '<span>[B]</span>');
        $("#a2").html(this.t('google') + '<span>[G]</span>');
        $("#a7").html(this.t('github') + '<span>[H]</span>');
        $("#a9").html(this.t('linux') + '<span>[L]</span>');
        $("#a6").html(this.t('so360') + '<span>[3]</span>');
        $("#a4").html(this.t('yahoo') + '<span>[Y]</span>');
        $("#a5").html(this.t('sogou') + '<span>[S]</span>');
        $("#a1").html(this.t('baidu') + '<span>[D]</span>');
        
        // 更新底部设置 - 保留原有结构，只更新文本
        let copyrightText = $('#ufoot').contents().first();
        if (copyrightText.length > 0) {
            copyrightText[0].nodeValue = this.t('copyright');
        }
        
        // 更新代理选项文本
        $("#proxy option:first").text(this.t('proxyNone'));
        $("#proxy option:eq(1)").text(this.t('proxy1'));
        $("#proxy option:eq(2)").text(this.t('proxy2'));
        $("#proxy option:last").text(this.t('proxyCustom'));
        
        // 确保语言切换链接存在
        if ($("#langSwitch").length === 0) {
            $("#proxy").parent().after('<span id="langSwitch"><a href="javascript:switchLanguage();"></a></span>');
        }
        $("#langSwitch a").text(this.t('language'));
        
        // 恢复代理选择
        this.restoreProxy();
        
        // 更新登录区域
        if ($("#login").length > 0) {
            // 先保存当前显示状态
            let isVisible = $("#login").is(":visible");
            
            // 只更新内部文本内容，不替换整个HTML结构
            $("#login a").each(function() {
                let href = $(this).attr('href');
                if (href && href.indexOf('editData') >= 0) {
                    $(this).text(i18n.t('showEdit'));
                } else if (href && href.indexOf('setting') >= 0) {
                    $(this).text(i18n.t('settings'));
                } else if (href && href.indexOf('showPass') >= 0) {
                    $(this).text(i18n.t('passwordSecurity'));
                } else if ($(this).attr('id') === 'copyAndCommit') {
                    $(this).text(i18n.t('copyAndCommit'));
                }
            });
            
            // 如果原来不可见，则恢复隐藏状态
            if (!isVisible) {
                $("#login").hide();
            }
        }
        
        // 更新编辑表单文本
        this.updateEditForm();
        
        // 更新源码&帮助
        $("#ufoot a:last").html(this.t('sourceAndHelp'));
        
        // 更新导入收藏
        if ($("#inBookmarks").length > 0) {
            $("#inBookmarks").find('button').text(this.t('cancel'));
        }
        
        // 更新设置面板
        this.updateSettings();
    },
    
    // 恢复代理选择
    restoreProxy: function() {
        let proxy = $.cookie("proxy");
        if (!proxy) {
            return;
        }
        
        let proxyList = ["https://ghproxy.com/", "https://gh.api.99988866.xyz/"];
        let select = $("#proxy");
        
        // 检查是否已经有代理选项，如果没有则添加
        let hasProxyOptions = false;
        select.find("option").each(function() {
            let val = $(this).val();
            if (val && val !== "0" && val !== "") {
                hasProxyOptions = true;
                return false;
            }
        });
        
        if (!hasProxyOptions) {
            // 添加代理选项，使用国际化文本
            for (let i = 0; i < proxyList.length; i++) {
                let ptmp = proxyList[i];
                let proxyKey = 'proxy' + (i + 1);
                let html = '<option value="' + ptmp + '" ' + (ptmp == proxy ? "selected" : "") + ' >' + this.t(proxyKey) + '</option>';
                select.append(html);
            }
            // 添加自定义选项
            select.append('<option value="0">' + this.t('proxyCustom') + '</option>');
        }
        
        // 更新现有代理选项的文本（国际化切换时需要）
        select.find("option").each(function() {
            let val = $(this).val();
            if (val && val !== "0" && val !== "") {
                for (let i = 0; i < proxyList.length; i++) {
                    if (val === proxyList[i]) {
                        $(this).text(i18n.t('proxy' + (i + 1)));
                        break;
                    }
                }
            }
        });
        
        // 设置选中值
        select.val(proxy);
    },
    
    // 更新设置面板
    updateSettings: function() {
        if ($("#setting").length > 0) {
            $("#setting > div:nth-child(1) > div:first-child").text(this.t('basicSettings'));
            
            // 更新设置链接文本
            let links = $("#setting > div:nth-child(1) > div:nth-child(2) a");
            if (links.length >= 3) {
                $(links[0]).text(this.t('setPassword'));
                $(links[1]).text(this.t('logout'));
                $(links[2]).text(this.t('importBookmarks'));
            }
            
            $("#setting > div:nth-child(2) > div:first-child").text(this.t('pluginSettings'));
            $("#setting button").text(this.t('close'));
            
            // 更新插件国际化文本
            if (typeof updatePluginI18n === 'function') {
                updatePluginI18n();
            }
        }
    },
    
    // 更新编辑表单文本
    updateEditForm: function() {
        // 更新标签文本
        $(".label-name").text(this.t('name') + '：');
        $(".label-url").text(this.t('url') + '：');
        $(".label-color").text(this.t('color') + '：');
        $(".label-shortcut").text(this.t('shortcut') + '：');
        $(".label-category").text(this.t('category') + '：');
        
        // 更新按钮文本
        $(".btn-save").text(this.t('save'));
        $(".btn-close").text(this.t('close'));
        $(".btn-add-link").text(this.t('addLink'));
        $(".btn-add-group").text(this.t('addGroup'));
        
        // 更新按钮 title 属性
        $(".title-toggle").attr('title', this.t('toggleView'));
        $(".title-edit").attr('title', this.t('edit'));
        $(".title-delete").attr('title', this.t('delete'));
    },
    
    // 更新密码管理页面
    updatePassPage: function() {
        // 更新标签文本
        $(".label-site-name").text(this.t('siteName') + ':');
        $(".label-username").text(this.t('username') + ':');
        $(".label-password").text(this.t('password') + '：');
        
        // 更新按钮文本
        $(".btn-show-hide").text(this.t('showHide'));
        $(".btn-delete").text(this.t('delete'));
        $(".btn-add").text(this.t('addPassword'));
    }
};

// 切换语言函数
function switchLanguage() {
    let currentLang = i18n.currentLang;
    let newLang = currentLang === 'zh-CN' ? 'en-US' : 'zh-CN';
    i18n.switchLanguage(newLang);
}
