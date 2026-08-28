/** 皮肤：当前样式为 default，写入 html[data-skin] */
var SKIN_KEY = "jisuye_skin";
var SKINS = [
    { id: "default", nameKey: "skinDefault", name: "经典", descKey: "skinDefaultDesc", desc: "浅色留白，原版布局", swatches: ["#f5f6f7", "#71aee1", "#ffffff"] },
    { id: "midnight", nameKey: "skinMidnight", name: "午夜", descKey: "skinMidnightDesc", desc: "深色护眼，紧凑卡片", swatches: ["#12151c", "#3d7dff", "#1c2230"] },
    { id: "paper", nameKey: "skinPaper", name: "宣纸", descKey: "skinPaperDesc", desc: "暖色书卷，宽松留白", swatches: ["#f4efe4", "#c45c26", "#fffaf0"] },
    { id: "neo", nameKey: "skinNeo", name: "极客", descKey: "skinNeoDesc", desc: "高对比，密集型", swatches: ["#0b0d10", "#00d4aa", "#10141a"] },
    { id: "board", nameKey: "skinBoard", name: "看板", descKey: "skinBoardDesc", desc: "分组磁贴网格", swatches: ["#dfe7f1", "#355c7d", "#ffffff"] },
    { id: "column", nameKey: "skinColumn", name: "分栏", descKey: "skinColumnDesc", desc: "报纸多栏竖排", swatches: ["#f7f1e6", "#9b1c1c", "#fffdf8"] },
    { id: "catalog", nameKey: "skinCatalog", name: "目录", descKey: "skinCatalogDesc", desc: "分组名在左，链接横排", swatches: ["#e8edf3", "#2f5d8a", "#f7f9fc"] },
    { id: "cabinet", nameKey: "skinCabinet", name: "列柜", descKey: "skinCabinetDesc", desc: "分组成列，链接竖排", swatches: ["#161820", "#c9a227", "#1e222c"] }
];

function skinLabel(s, key, fallback) {
    if (typeof i18n !== "undefined") {
        var v = i18n.t(key);
        if (v && v !== key) return v;
    }
    return fallback;
}

function currentSkin() {
    var id = document.documentElement.getAttribute("data-skin");
    if (id) return id;
    try { return localStorage.getItem(SKIN_KEY) || "default"; } catch (e) { return "default"; }
}

function applySkin(id, persist) {
    var ok = SKINS.some(function (s) { return s.id === id; });
    if (!ok) id = "default";
    document.documentElement.setAttribute("data-skin", id);
    if (persist !== false) {
        try { localStorage.setItem(SKIN_KEY, id); } catch (e) {}
    }
    renderSkinPicker();
}

function renderSkinPicker() {
    var box = document.getElementById("skin-list");
    if (!box) return;
    var cur = currentSkin();
    box.innerHTML = SKINS.map(function (s) {
        var name = skinLabel(s, s.nameKey, s.name);
        var desc = skinLabel(s, s.descKey, s.desc);
        var sw = s.swatches.map(function (c) {
            return '<i style="background:' + c + '"></i>';
        }).join("");
        return '<button type="button" class="skin-item' + (s.id === cur ? " active" : "") +
            '" data-skin="' + s.id + '"><div class="skin-swatch">' + sw +
            '</div><div class="skin-name">' + name + '</div><div class="skin-desc">' + desc + "</div></button>";
    }).join("");
    box.onclick = function (e) {
        var btn = e.target.closest("[data-skin]");
        if (btn) applySkin(btn.getAttribute("data-skin"));
    };
}

(function bootSkin() {
    var id = "default";
    try { id = localStorage.getItem(SKIN_KEY) || "default"; } catch (e) {}
    if (!SKINS.some(function (s) { return s.id === id; })) {
        id = "default";
        try { localStorage.setItem(SKIN_KEY, id); } catch (e) {}
    }
    document.documentElement.setAttribute("data-skin", id);
})();
