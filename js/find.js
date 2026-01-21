// 搜索链接功能
var findResults = [];
var findSelectedIndex = 0;
var findKeyword = "";
var findInput, findResultDiv;

// 初始化搜索框
function initFind() {
    if ($("#findContainer").length > 0) {
        return;
    }
    
    var html = '<div id="findContainer" style="display:none;">' +
        '<input type="text" id="findInput" placeholder="' + (typeof i18n !== 'undefined' ? i18n.t('searchLinks') : '搜索链接...') + '" autocomplete="off" />' +
        '<div id="findResults"></div>' +
        '</div>';
    
    $("body").append(html);
    
    findInput = $("#findInput");
    findResultDiv = $("#findResults");
    
    // 添加样式
    var style = '<style>' +
        '#findContainer {' +
        'position: fixed;' +
        'top: 25%;' +
        'left: 50%;' +
        'transform: translateX(-50%);' +
        'z-index: 9999;' +
        '}' +
        '#findInput {' +
        'width: 500px;' +
        'padding: 8px 12px;' +
        'font-size: 14px;' +
        'border: 2px solid #bbb;' +
        'border-radius: 4px;' +
        'outline: none;' +
        'background: #ddd;' +
        '}' +
        '#findResults {' +
        'width: 524px;' +
        'max-height: 300px;' +
        'overflow-y: auto;' +
        'background: #ddd;' +
        'border: 2px solid #bbb;' +
        'border-top: none;' +
        'border-radius: 0 0 4px 4px;' +
        'margin-top: -1px;' +
        '}' +
        '.findResultItem {' +
        'padding: 8px 12px;' +
        'cursor: pointer;' +
        'border-bottom: 1px solid #bbb;' +
        'font-size: 13px;' +
        '}' +
        '.findResultItem:hover {' +
        'background: #666;' +
        '}' +
        '.findResultItem.selected {' +
        'background: #666;' +
        'color: white;' +
        '}' +
        '.findHighlight {' +
        'color: #ff0000;' +
        'font-weight: bold;' +
        'background: yellow;' +
        '}' +
        '@media screen and (max-width: 768px) {' +
        '#findInput, #findResults {' +
        'width: 90%;' +
        '}' +
        '}' +
        '</style>';
    
    $("head").append(style);
    
    // 绑定事件
    findInput.on("input", function() {
        findKeyword = $(this).val();
        searchLinks();
    });
    
    findInput.on("keydown", function(e) {
        if (e.keyCode == 38) {
            // 上键
            e.preventDefault();
            selectResult(-1);
        } else if (e.keyCode == 40) {
            // 下键
            e.preventDefault();
            selectResult(1);
        } else if (e.keyCode == 13) {
            // 回车
            e.preventDefault();
            openSelectedResult();
        } else if (e.keyCode == 27) {
            // ESC
            e.preventDefault();
            closeFind();
        }
    });
}

// 显示搜索框
function showFind() {
    initFind();
    findInput.val("");
    findKeyword = "";
    findResults = [];
    findSelectedIndex = 0;
    findResultDiv.html("");
    $("#findContainer").show();
    findInput.focus();
}

// 关闭搜索框
function closeFind() {
    $("#findContainer").hide();
}

// 高亮匹配的关键字
function highlightKeyword(text, keyword) {
    if (!keyword) {
        return text;
    }
    var regex = new RegExp("(" + keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ")", "gi");
    return text.replace(regex, '<span class="findHighlight">$1</span>');
}

// 搜索链接
function searchLinks() {
    if (!json || !json.links) {
        return;
    }
    
    findResults = [];
    findSelectedIndex = 0;
    
    if (!findKeyword) {
        findResultDiv.html("");
        return;
    }
    
    var keyword = findKeyword.toLowerCase();
    
    for (var i = 0; i < json.links.length; i++) {
        var group = json.links[i];
        if (group.list) {
            for (var j = 0; j < group.list.length; j++) {
                var link = group.list[j];
                var name = link.n || "";
                var url = link.l || "";
                
                if (name.toLowerCase().indexOf(keyword) >= 0 || 
                    url.toLowerCase().indexOf(keyword) >= 0) {
                    findResults.push({
                        name: name,
                        url: url,
                        group: group.group
                    });
                }
            }
        }
    }
    
    renderResults();
}

// 渲染搜索结果
function renderResults() {
    var noResultsText = typeof i18n !== 'undefined' ? i18n.t('noResults') : '无匹配结果';
    if (findResults.length == 0) {
        findResultDiv.html('<div class="findResultItem" style="color:#999;">' + noResultsText + '</div>');
        return;
    }
    
    var html = "";
    for (var i = 0; i < findResults.length; i++) {
        var result = findResults[i];
        var selectedClass = i == findSelectedIndex ? "selected" : "";
        var highlightedName = highlightKeyword(result.name, findKeyword);
        var highlightedUrl = highlightKeyword(result.url, findKeyword);
        
        html += '<div class="findResultItem ' + selectedClass + '" data-index="' + i + '">' +
            highlightedName + ' | ' + highlightedUrl +
            '</div>';
    }
    
    findResultDiv.html(html);
    
    // 绑定点击事件
    findResultDiv.find(".findResultItem").on("click", function() {
        var index = $(this).data("index");
        findSelectedIndex = index;
        openSelectedResult();
    });
    
    // 绑定鼠标悬停事件
    findResultDiv.find(".findResultItem").on("mouseenter", function() {
        var index = $(this).data("index");
        updateSelected(index);
    });
}

// 更新选中状态
function updateSelected(index) {
    if (index < 0 || index >= findResults.length) {
        return;
    }
    
    findSelectedIndex = index;
    renderResults();
}

// 选择结果
function selectResult(direction) {
    var newIndex = findSelectedIndex + direction;
    if (newIndex < 0) {
        newIndex = findResults.length - 1;
    } else if (newIndex >= findResults.length) {
        newIndex = 0;
    }
    
    updateSelected(newIndex);
    
    // 滚动到可见区域
    var selectedElement = findResultDiv.find(".findResultItem.selected");
    if (selectedElement.length > 0) {
        var containerHeight = findResultDiv.height();
        var elementTop = selectedElement.position().top;
        var elementHeight = selectedElement.outerHeight();
        var scrollTop = findResultDiv.scrollTop();
        
        if (elementTop < 0) {
            findResultDiv.scrollTop(scrollTop + elementTop);
        } else if (elementTop + elementHeight > containerHeight) {
            findResultDiv.scrollTop(scrollTop + elementTop + elementHeight - containerHeight);
        }
    }
}

// 打开选中的结果
function openSelectedResult() {
    if (findSelectedIndex < 0 || findSelectedIndex >= findResults.length) {
        return;
    }
    
    var result = findResults[findSelectedIndex];
    var url = result.url;
    if (url.indexOf("://") < 0) {
        url = "http://" + url;
    }
    
    window.open(url, "_blank");
    closeFind();
}

// 监听F键
document.addEventListener("keydown", function(e) {
    var target = e.target;
    if (target && (target.tagName == "INPUT" || target.tagName == "TEXTAREA")) {
        return;
    }
    
    if (e.key && e.key.toLowerCase() == "f") {
        e.preventDefault();
        showFind();
    }
});
