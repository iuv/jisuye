// 注册插件 插件名称最好4个字
var PL = {
    "搜索提示": "bdSuggestion",
    "天气插件": "weather",
    "万年历": "wannianli",
    "数字时钟": "clock",
    "快捷便签": "notes",
    "倒计时": "countdown",
    "每日壁纸": "wallpaper"
};
var PL_I18N = {
    "搜索提示": "pluginSearchTip",
    "天气插件": "pluginWeather",
    "万年历": "pluginCalendar",
    "数字时钟": "pluginClock",
    "快捷便签": "pluginNotes",
    "倒计时": "pluginCountdown",
    "每日壁纸": "pluginWallpaper"
};
var PL_DESC = {
    "搜索提示": "pluginSearchTipDesc",
    "天气插件": "pluginWeatherDesc",
    "万年历": "pluginCalendarDesc",
    "数字时钟": "pluginClockDesc",
    "快捷便签": "pluginNotesDesc",
    "倒计时": "pluginCountdownDesc",
    "每日壁纸": "pluginWallpaperDesc"
};
var PLFUN = {};
var PLJSON = {};

function pluginDisplayName(n) {
    if (typeof i18n !== "undefined" && PL_I18N[n]) return i18n.t(PL_I18N[n]);
    return n;
}
function pluginDesc(n) {
    if (typeof i18n !== "undefined" && PL_DESC[n]) return i18n.t(PL_DESC[n]);
    return "";
}

function pluginRenderSettings() {
    let html = "";
    Object.keys(PL).forEach(function (n) {
        const desc = pluginDesc(n);
        html += '<label class="plugin-item">' +
            '<div class="plugin-meta"><span class="plugin-name">' + pluginDisplayName(n) + "</span>" +
            (desc ? '<span class="plugin-desc">' + desc + "</span>" : "") + "</div>" +
            '<input type="checkbox" ' + (PLJSON[n] ? "checked" : "") +
            " onchange='setPlugin(\"" + n + "\", this)'>" +
            '<span class="plugin-switch" aria-hidden="true"></span></label>';
    });
    const plugin = document.getElementById("plugin");
    if (plugin) plugin.innerHTML = html;
}

function pluginInit() {
    pluginRenderSettings();
    if (typeof renderSkinPicker === "function") renderSkinPicker();
    Object.keys(PL).forEach(loadPlugin);
}

function loadPlugin(n) {
    if (!PL[n]) return;
    const id = PL[n];
    const src = "plugin/" + id + "/core.js?v10";
    if (PLJSON[n]) {
        if (PLFUN[id]) {
            PLFUN[id].init();
            return;
        }
        if (document.querySelector('script[data-plugin="' + id + '"]')) return;
        const script = document.createElement("script");
        script.src = src;
        script.setAttribute("data-plugin", id);
        script.onload = function () {
            if (PLFUN[id]) PLFUN[id].init();
        };
        document.head.appendChild(script);
    } else if (PLFUN[id]) {
        PLFUN[id].uninit();
    }
}

function closePanels() {
    ["setting", "skin-panel"].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = "none";
            el.classList.remove("open");
        }
    });
    const m = document.getElementById("setting-mask");
    if (m) m.style.display = "none";
}

function openPanel(id) {
    closePanels();
    if (typeof closePrompt === "function" && document.getElementById("dlg") && document.getElementById("dlg").classList.contains("open")) {
        closePrompt(null);
    }
    const s = document.getElementById(id);
    const m = document.getElementById("setting-mask");
    if (s) {
        s.style.display = "block";
        s.classList.add("open");
    }
    if (m) m.style.display = "block";
}

function setting() {
    if (typeof syncGuestUi === "function") syncGuestUi();
    openPanel("setting");
}

function closeSetting() {
    closePanels();
}

function showSkin() {
    if (typeof renderSkinPicker === "function") renderSkinPicker();
    openPanel("skin-panel");
}

function closeSkin() {
    closePanels();
}

function setPlugin(name, t) {
    PLJSON[name] = t.checked;
    Cookies.set("plugin", JSON.stringify(PLJSON), { expires: 300, path: "/" });
    loadPlugin(name);
}

function bootPlugins() {
    let pjson = Cookies.get("plugin");
    if (pjson) {
        try { PLJSON = JSON.parse(pjson); } catch (e) { PLJSON = {}; }
    }
    if (!user) {
        PLJSON["搜索提示"] = true;
    }
    pluginInit();
    pluginWatchDayChange();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootPlugins);
} else {
    bootPlugins();
}

document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    const dlg = document.getElementById("dlg");
    if (dlg && dlg.classList.contains("open")) {
        if (typeof closePrompt === "function") closePrompt(null);
        e.stopPropagation();
        return;
    }
    const s = document.getElementById("setting");
    const sk = document.getElementById("skin-panel");
    if ((s && s.classList.contains("open")) || (sk && sk.classList.contains("open"))) {
        closePanels();
        e.stopPropagation();
    }
});

function updatePluginI18n() {
    pluginRenderSettings();
    if (typeof renderSkinPicker === "function") renderSkinPicker();
    pluginRefreshAll();
}

function pluginRefreshAll(reason) {
    Object.keys(PLFUN).forEach(function (id) {
        if (PLFUN[id] && typeof PLFUN[id].refresh === "function") {
            try { PLFUN[id].refresh(reason); } catch (e) {}
        }
    });
}

function pluginLocalDay() {
    var d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
}

function pluginWatchDayChange() {
    if (pluginWatchDayChange.bound) return;
    pluginWatchDayChange.bound = true;
    var day = pluginLocalDay();
    function check() {
        var next = pluginLocalDay();
        if (next === day) return;
        day = next;
        pluginRefreshAll("day");
    }
    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") check();
    });
    window.addEventListener("focus", check);
    window.addEventListener("pageshow", check);
    setInterval(check, 60000);
    var now = new Date();
    var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    setTimeout(function () {
        check();
        setInterval(check, 24 * 60 * 60 * 1000);
    }, midnight - now + 1000);
}

/* ---------- 插件浮窗：拖动 + 缩放，位置尺寸记在本机 ---------- */
var PL_GEOM_KEY = "jisuye_pl_geom";
var PL_Z = 40;
var plWidgets = {};
var plWinBound = false;

function pluginGeomAll() {
    try { return JSON.parse(localStorage.getItem(PL_GEOM_KEY) || "{}"); } catch (e) { return {}; }
}
function pluginGeomGet(id) {
    var all = pluginGeomAll();
    return all && all[id] ? all[id] : null;
}
function pluginGeomSet(id, geom) {
    var all = pluginGeomAll();
    var prev = all[id];
    var el = document.getElementById(id);
    var height = geom.height;
    if (el && el.classList.contains("collapsed") && prev && prev.height) height = prev.height;
    all[id] = {
        left: Math.round(geom.left),
        top: Math.round(geom.top),
        width: Math.round(geom.width),
        height: Math.round(height)
    };
    try { localStorage.setItem(PL_GEOM_KEY, JSON.stringify(all)); } catch (e) {}
}

function pluginInjectWidgetStyle() {
    if (document.getElementById("pl-widget-style")) return;
    var s = document.createElement("style");
    s.id = "pl-widget-style";
    s.textContent = [
        ".pl-widget{position:fixed;z-index:40;box-sizing:border-box;display:flex;flex-direction:column;overflow:hidden;user-select:none;touch-action:none;background:var(--widget-bg,rgba(255,255,255,.92));border:1px solid var(--widget-bd,#ddd);border-radius:var(--radius,8px);box-shadow:var(--shadow,0 2px 10px rgba(0,0,0,.08));color:var(--widget-fg,#333);}",
        ".pl-widget .pl-body{flex:1;min-width:0;min-height:0;overflow:auto;display:flex;flex-direction:column;}",
        ".pl-widget .pl-resize{position:absolute;right:0;bottom:0;width:14px;height:14px;cursor:nwse-resize;z-index:3;}",
        ".pl-widget .pl-resize::after{content:\"\";position:absolute;right:3px;bottom:3px;width:7px;height:7px;border-right:2px solid var(--widget-muted,rgba(0,0,0,.28));border-bottom:2px solid var(--widget-muted,rgba(0,0,0,.28));}",
        ".pl-widget.collapsed{height:auto!important;min-height:36px;}",
        ".pl-widget.collapsed .pl-resize{display:none;}",
        ".pl-widget.collapsed .pl-body{overflow:visible;flex:none;min-height:36px;}",
        ".pl-widget [data-drag]{min-height:34px;display:flex;align-items:center;box-sizing:border-box;background:var(--widget-bar,rgba(113,174,225,.18));}",
        ".pl-widget.dragging,.pl-widget.resizing{opacity:.94;}",
        ".pl-widget [data-drag],.pl-widget.pl-drag-all{cursor:move;}",
        ".pl-widget input,.pl-widget textarea{cursor:text;touch-action:auto;}",
        ".pl-widget button,.pl-widget a,[data-act],[data-no-drag]{cursor:pointer;}"
    ].join("");
    document.head.appendChild(s);
}

function pluginClamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
}

function pluginDefaultGeom(opts) {
    var d = opts.def || {};
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var w = d.width || opts.minW || 200;
    var h = d.height || opts.minH || 80;
    w = Math.min(w, Math.max(opts.minW || 80, vw - 16));
    var left = d.right != null ? vw - d.right - w : (d.left != null ? d.left : 12);
    var top = d.bottom != null ? vh - d.bottom - (d.placeH || opts.minH || 36) : (d.top != null ? d.top : 12);
    return { left: left, top: top, width: w, height: h };
}

function pluginReadGeom(el) {
    return {
        left: parseFloat(el.style.left) || el.offsetLeft || 0,
        top: parseFloat(el.style.top) || el.offsetTop || 0,
        width: el.offsetWidth,
        height: el.offsetHeight
    };
}

function pluginBarH(opts) {
    return (opts.def && opts.def.placeH) || opts.minH || 36;
}
function pluginDefH(opts) {
    return (opts.def && opts.def.height) || opts.expandMinH || 200;
}
function pluginExpandMin(opts) {
    return opts.expandMinH || pluginBarH(opts);
}

function pluginApplyGeom(el, geom, opts) {
    if (!el || !geom) return;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var minW = opts.minW || 120;
    var minH = opts.minH || 36;
    var maxW = Math.min(opts.maxW || vw, vw - 8);
    var maxH = Math.min(opts.maxH || vh, vh - 8);
    var w = pluginClamp(geom.width, minW, Math.max(minW, maxW));
    var h = geom.height;
    var barH = pluginBarH(opts);
    if (!el.classList.contains("collapsed")) {
        if (!(h > barH + 8)) h = pluginDefH(opts);
        h = pluginClamp(h, Math.max(minH, pluginExpandMin(opts)), Math.max(minH, maxH));
    }
    var left = pluginClamp(geom.left, 4, Math.max(4, vw - Math.min(w, 64)));
    var top = pluginClamp(geom.top, 4, Math.max(4, vh - 28));
    el.style.left = left + "px";
    el.style.top = top + "px";
    el.style.right = "auto";
    el.style.bottom = "auto";
    el.style.width = w + "px";
    if (!el.classList.contains("collapsed")) el.style.height = h + "px";
    else el.style.height = "auto";
}

function pluginEnsureResize(el, opts) {
    if (opts.resizable === false) return;
    if (!el.querySelector(":scope > .pl-resize")) {
        var rz = document.createElement("div");
        rz.className = "pl-resize";
        rz.title = "缩放";
        el.appendChild(rz);
    }
}

function pluginWidgetFront(el) {
    PL_Z += 1;
    el.style.zIndex = String(PL_Z);
}

function pluginBindWinResize() {
    if (plWinBound) return;
    plWinBound = true;
    window.addEventListener("resize", function () {
        Object.keys(plWidgets).forEach(function (id) {
            var rec = plWidgets[id];
            if (!rec || !rec.el || !rec.el.parentNode) return;
            pluginApplyGeom(rec.el, pluginReadGeom(rec.el), rec.opts);
        });
    });
}

function pluginBindMove(el, opts) {
    if (el._plBound) return;
    el._plBound = true;
    el.addEventListener("pointerdown", function (e) {
        if (e.button && e.button !== 0) return;
        var rz = e.target.closest(".pl-resize");
        var interactive = e.target.closest("input,textarea,select,button,a,[data-no-drag]");
        var handle = opts.drag === "all" || e.target.closest("[data-drag]");
        if (!rz && interactive) return;
        if (!rz && !handle) return;
        pluginWidgetFront(el);
        var startX = e.clientX, startY = e.clientY;
        var g = pluginReadGeom(el);
        var moved = false;
        var mode = rz ? "resize" : "drag";
        el.classList.add(mode === "resize" ? "resizing" : "dragging");
        function onMove(ev) {
            var dx = ev.clientX - startX, dy = ev.clientY - startY;
            if (!moved && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) moved = true;
            if (!moved) return;
            ev.preventDefault();
            if (mode === "drag") {
                pluginApplyGeom(el, { left: g.left + dx, top: g.top + dy, width: g.width, height: g.height }, opts);
            } else {
                pluginApplyGeom(el, { left: g.left, top: g.top, width: g.width + dx, height: g.height + dy }, opts);
            }
        }
        function onUp() {
            el.classList.remove("dragging", "resizing");
            el._plDragged = moved;
            if (moved) pluginGeomSet(el.id, pluginReadGeom(el));
            document.removeEventListener("pointermove", onMove);
            document.removeEventListener("pointerup", onUp);
        }
        document.addEventListener("pointermove", onMove);
        document.addEventListener("pointerup", onUp);
    });
    el.addEventListener("click", function (e) {
        if (!el._plDragged) return;
        e.stopPropagation();
        e.preventDefault();
        el._plDragged = false;
    }, true);
}

function pluginMountWidget(id, opts) {
    opts = opts || {};
    pluginInjectWidgetStyle();
    var el = document.getElementById(id);
    if (!el) {
        el = document.createElement("div");
        el.id = id;
        document.body.appendChild(el);
    }
    el.classList.add("pl-widget");
    if (opts.drag === "all") el.classList.add("pl-drag-all");
    var body = el.querySelector(":scope > .pl-body");
    if (!body) {
        body = document.createElement("div");
        body.className = "pl-body";
        el.insertBefore(body, el.firstChild);
    }
    pluginEnsureResize(el, opts);
    var geom = pluginGeomGet(id) || pluginDefaultGeom(opts);
    if (!(geom.height > pluginBarH(opts) + 8)) {
        geom.height = pluginDefH(opts);
        if (pluginGeomGet(id)) pluginGeomSet(id, geom);
    }
    pluginApplyGeom(el, geom, opts);
    pluginBindMove(el, opts);
    pluginBindWinResize();
    plWidgets[id] = { el: el, opts: opts, body: body };
    return { wrap: el, body: body };
}

function pluginUnmountWidget(id) {
    delete plWidgets[id];
    var el = document.getElementById(id);
    if (el && el.parentNode) el.parentNode.removeChild(el);
}

function pluginWidgetSync(el) {
    if (!el) return;
    var rec = plWidgets[el.id];
    if (!rec) return;
    pluginEnsureResize(el, rec.opts);
    var saved = pluginGeomGet(el.id);
    var def = pluginDefaultGeom(rec.opts);
    var read = pluginReadGeom(el);
    var g = saved ? {
        left: saved.left,
        top: saved.top,
        width: saved.width,
        height: saved.height
    } : {
        left: read.left,
        top: read.top,
        width: read.width || def.width,
        height: def.height
    };
    if (!(g.height > pluginBarH(rec.opts) + 8)) g.height = def.height;
    pluginApplyGeom(el, g, rec.opts);
}
