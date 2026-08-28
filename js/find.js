// 搜索链接功能
var findResults = [];
var findSelectedIndex = 0;
var findKeyword = "";
var findInput, findResultDiv;

function findText(key, fallback) {
    if (typeof i18n !== "undefined") {
        var v = i18n.t(key);
        if (v && v !== key) return v;
    }
    return fallback;
}

// 初始化搜索框
function initFind() {
    if (document.getElementById("findContainer")) {
        return;
    }

    var html = '<div id="findMask"></div>' +
        '<div id="findContainer">' +
        '<div class="find-box">' +
        '<div class="find-search">' +
        '<span class="find-ico" aria-hidden="true">⌕</span>' +
        '<input type="text" id="findInput" placeholder="' + findText("searchLinks", "搜索链接...") + '" autocomplete="off" />' +
        '<kbd class="find-esc">ESC</kbd>' +
        '</div>' +
        '<div id="findResults"></div>' +
        '</div></div>';

    document.body.insertAdjacentHTML('beforeend', html);

    findInput = document.getElementById("findInput");
    findResultDiv = document.getElementById("findResults");

    document.getElementById("findMask").addEventListener("click", closeFind);

    findInput.addEventListener("input", function() {
        findKeyword = this.value;
        searchLinks();
    });

    findInput.addEventListener("keydown", function(e) {
        if (e.key === "ArrowUp") {
            e.preventDefault();
            selectResult(-1);
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            selectResult(1);
        } else if (e.key === "Enter") {
            e.preventDefault();
            openSelectedResult();
        } else if (e.key === "Escape") {
            e.preventDefault();
            closeFind();
        }
    });

    // 委托：避免 hover 重绘 DOM 后 click 丢失
    findResultDiv.addEventListener("mousedown", function(e) {
        if (e.button !== 0) return;
        var item = e.target.closest(".findResultItem");
        if (!item || item.dataset.index == null) return;
        e.preventDefault();
        findSelectedIndex = parseInt(item.dataset.index, 10);
        openSelectedResult();
    });

    findResultDiv.addEventListener("mouseover", function(e) {
        var item = e.target.closest(".findResultItem");
        if (!item || item.dataset.index == null) return;
        var index = parseInt(item.dataset.index, 10);
        if (index === findSelectedIndex) return;
        findSelectedIndex = index;
        highlightSelected();
    });
}

// 显示搜索框
function showFind() {
    initFind();
    findInput.value = "";
    findInput.placeholder = findText("searchLinks", "搜索链接...");
    findKeyword = "";
    findResults = [];
    findSelectedIndex = 0;
    findResultDiv.innerHTML = "";
    document.getElementById("findMask").style.display = "block";
    document.getElementById("findContainer").style.display = "block";
    findInput.focus();
}

// 关闭搜索框
function closeFind() {
    var box = document.getElementById("findContainer");
    var mask = document.getElementById("findMask");
    if (box) box.style.display = "none";
    if (mask) mask.style.display = "none";
}

function escHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
}

// 高亮匹配的关键字
function highlightKeyword(text, keyword) {
    text = escHtml(text);
    if (!keyword) {
        return text;
    }
    var escKey = escHtml(keyword).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var regex = new RegExp("(" + escKey + ")", "gi");
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
        findResultDiv.innerHTML = "";
        return;
    }
    if (!json || !json.links) {
        findResultDiv.innerHTML = "";
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
    var noResultsText = findText("noResults", "无匹配结果");
    if (findResults.length == 0) {
        findResultDiv.innerHTML = '<div class="findResultItem find-empty">' + noResultsText + '</div>';
        return;
    }

    var html = "";
    for (var i = 0; i < findResults.length; i++) {
        var result = findResults[i];
        var selectedClass = i == findSelectedIndex ? "selected" : "";
        var highlightedName = highlightKeyword(result.name, findKeyword);
        var highlightedUrl = highlightKeyword(result.url, findKeyword);
        var group = escHtml(result.group || "");

        html += '<div class="findResultItem ' + selectedClass + '" data-index="' + i + '">' +
            '<div class="find-name">' + highlightedName + '</div>' +
            '<div class="find-meta"><span class="find-group">' + group + '</span><span class="find-url">' + highlightedUrl + '</span></div>' +
            '</div>';
    }

    findResultDiv.innerHTML = html;
}

function highlightSelected() {
    var items = findResultDiv.querySelectorAll(".findResultItem");
    items.forEach(function(el) {
        var idx = parseInt(el.dataset.index, 10);
        el.classList.toggle("selected", idx === findSelectedIndex);
    });
}

function updateSelected(index) {
    if (index < 0 || index >= findResults.length) {
        return;
    }
    findSelectedIndex = index;
    highlightSelected();
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
    var selectedElement = findResultDiv.querySelector(".findResultItem.selected");
    if (selectedElement) {
        var containerHeight = findResultDiv.clientHeight;
        var elementTop = selectedElement.offsetTop;
        var elementHeight = selectedElement.offsetHeight;
        var scrollTop = findResultDiv.scrollTop;

        if (elementTop < scrollTop) {
            findResultDiv.scrollTop = elementTop;
        } else if (elementTop + elementHeight > scrollTop + containerHeight) {
            findResultDiv.scrollTop = elementTop + elementHeight - containerHeight;
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
        url = "https://" + url;
    }
    
    window.open(url, "_blank");
    closeFind();
}

// 监听F键
document.addEventListener("keydown", function(e) {
    var target = e.target;
    if (target && (target.tagName == "INPUT" || target.tagName == "TEXTAREA" || target.tagName == "SELECT" || target.isContentEditable)) {
        return;
    }
    
    if (e.key && e.key.toLowerCase() == "f") {
        e.preventDefault();
        showFind();
    }
});
