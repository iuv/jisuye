/** 倒计时 */
var countdown = (function () {
    var BOX_ID = "countdown-box";
    var STYLE_ID = "countdown-style";
    var STORE_KEY = "jisuye_countdown";
    var COLLAPSE_KEY = "jisuye_cd_collapsed";
    var list = [];
    var collapsed = true;
    var adding = false;
    var timer = null;
    var wrap, body;

    function t(key, fallback) {
        if (typeof i18n !== "undefined") {
            var v = i18n.t(key);
            if (v !== key) return v;
        }
        return fallback;
    }
    function load() {
        try { list = JSON.parse(localStorage.getItem(STORE_KEY) || "[]"); } catch (e) { list = []; }
        if (!Array.isArray(list)) list = [];
        try { collapsed = localStorage.getItem(COLLAPSE_KEY) !== "0"; } catch (e) { collapsed = true; }
    }
    function save() {
        try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) {}
    }
    function pad(n) { return n < 10 ? "0" + n : "" + n; }
    function esc(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
        });
    }

    function remain(at) {
        var diff = at - Date.now();
        if (diff <= 0) return t("cdDone", "已到点");
        var s = Math.floor(diff / 1000);
        var d = Math.floor(s / 86400); s %= 86400;
        var h = Math.floor(s / 3600); s %= 3600;
        var m = Math.floor(s / 60); s %= 60;
        if (d > 0) return d + t("cdDay", "天") + " " + pad(h) + ":" + pad(m) + ":" + pad(s);
        return pad(h) + ":" + pad(m) + ":" + pad(s);
    }

    function injectStyle() {
        if (document.getElementById(STYLE_ID)) return;
        var s = document.createElement("style");
        s.id = STYLE_ID;
        s.textContent = [
            "#countdown-box{background:var(--widget-bg);border:1px solid var(--widget-bd);border-radius:var(--radius);box-shadow:var(--shadow);color:var(--widget-fg);font-size:12px;}",
            "#countdown-box .cd-bar{display:flex;justify-content:space-between;padding:6px 10px;background:var(--widget-bar);font-weight:600;flex-shrink:0;}",
            "#countdown-box .cd-actions{display:flex;align-items:center;gap:4px;margin-left:auto;}",
            "#countdown-box .cd-plus{border:0;background:transparent;color:inherit;font-size:16px;line-height:1;cursor:pointer;padding:0 4px;}",
            "#countdown-box .cd-toggle{font-weight:normal;color:var(--widget-accent);font-size:11px;}",
            "#countdown-box .cd-body{padding:8px;flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;}",
            "#countdown-box.collapsed .cd-body{display:none;}",
            "#countdown-box .cd-list{flex:1;min-height:0;overflow:auto;}",
            "#countdown-box .cd-item{display:flex;justify-content:space-between;gap:6px;padding:6px 0;border-bottom:1px dashed var(--widget-bd);}",
            "#countdown-box .cd-item b{display:block;word-break:break-word;}",
            "#countdown-box .cd-item span{color:var(--widget-accent);font-variant-numeric:tabular-nums;}",
            "#countdown-box .cd-item button{border:0;background:transparent;color:var(--widget-danger);cursor:pointer;}",
            "#countdown-box .cd-add{display:none;flex-direction:column;gap:4px;margin-top:8px;flex-shrink:0;}",
            "#countdown-box.adding .cd-add{display:flex;}",
            "#countdown-box input{border:1px solid var(--widget-bd);border-radius:4px;padding:4px 6px;background:var(--input-bg);color:var(--input-fg);}",
            "#countdown-box .cd-add button{border:0;background:var(--widget-accent);color:var(--legend-fg);border-radius:4px;padding:4px;cursor:pointer;}",
            "#countdown-box .cd-empty{color:var(--widget-muted);text-align:center;padding:6px 0;}"
        ].join("");
        document.head.appendChild(s);
    }

    function toLocalValue(ts) {
        var d = new Date(ts);
        var p = function (n) { return n < 10 ? "0" + n : "" + n; };
        return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + "T" + p(d.getHours()) + ":" + p(d.getMinutes());
    }

    function render() {
        if (!body || !wrap) return;
        wrap.classList.toggle("collapsed", collapsed);
        wrap.classList.toggle("adding", adding);
        if (typeof pluginWidgetSync === "function") pluginWidgetSync(wrap);
        var items = list.map(function (n, i) {
            return '<div class="cd-item"><div><b>' + esc(n.title) + "</b><span>" + remain(n.at) +
                '</span></div><button type="button" data-del="' + i + '" data-no-drag>×</button></div>';
        }).join("");
        if (!items) items = '<div class="cd-empty">' + t("cdEmpty", "还没有倒计时") + "</div>";
        var def = toLocalValue(Date.now() + 86400000);
        body.innerHTML =
            '<div class="cd-bar" data-drag><span data-act="toggle">' + t("pluginCountdown", "倒计时") +
            (list.length ? " (" + list.length + ")" : "") + '</span><span class="cd-actions">' +
            '<button type="button" class="cd-plus" data-act="compose" data-no-drag title="' + t("cdAdd", "添加") + '">' +
            (adding ? "×" : "+") + '</button><span class="cd-toggle" data-act="toggle">' +
            (collapsed ? t("calExpand", "展开") : t("calCollapse", "收起")) + "</span></span></div>" +
            '<div class="cd-body"><div class="cd-list">' + items + "</div>" +
            '<div class="cd-add"><input id="cd-title" maxlength="20" placeholder="' + t("cdTitle", "标题") +
            '"><input id="cd-at" type="datetime-local" value="' + def +
            '"><button type="button" data-act="add" data-no-drag>' + t("cdAdd", "添加") + "</button></div></div>";
    }

    function onClick(e) {
        if (wrap && wrap._plDragged) return;
        var del = e.target.getAttribute("data-del");
        if (del != null) {
            list.splice(parseInt(del, 10), 1);
            save();
            render();
            return;
        }
        var actEl = e.target.closest("[data-act]");
        var act = actEl && actEl.getAttribute("data-act");
        if (act === "toggle") {
            collapsed = !collapsed;
            if (collapsed) adding = false;
            try { localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0"); } catch (err) {}
            render();
            return;
        }
        if (act === "compose") {
            if (collapsed) {
                collapsed = false;
                try { localStorage.setItem(COLLAPSE_KEY, "0"); } catch (err) {}
            }
            adding = !adding;
            render();
            if (adding) {
                var titleEl = document.getElementById("cd-title");
                if (titleEl) titleEl.focus();
            }
            return;
        }
        if (act === "add") {
            var titleEl = document.getElementById("cd-title");
            var atEl = document.getElementById("cd-at");
            var title = titleEl ? titleEl.value.trim() : "";
            var at = atEl && atEl.value ? new Date(atEl.value).getTime() : NaN;
            if (!title || !at) return;
            list.push({ title: title, at: at });
            if (list.length > 12) list.shift();
            save();
            adding = false;
            render();
        }
    }

    return {
        init: function () {
            this.uninit();
            load();
            injectStyle();
            var ui = pluginMountWidget(BOX_ID, {
                minW: 180, minH: 36, maxW: 480, maxH: 560, expandMinH: 160,
                def: { left: 12, top: 268, width: 220, height: 200, placeH: 36 }
            });
            wrap = ui.wrap;
            body = ui.body;
            wrap.addEventListener("click", onClick);
            render();
            timer = setInterval(function () {
                if (!body || collapsed) return;
                var spans = body.querySelectorAll(".cd-item span");
                spans.forEach(function (span, i) {
                    if (list[i]) span.textContent = remain(list[i].at);
                });
            }, 1000);
        },
        uninit: function () {
            if (timer) { clearInterval(timer); timer = null; }
            if (wrap) wrap.removeEventListener("click", onClick);
            pluginUnmountWidget(BOX_ID);
            wrap = body = null;
            var st = document.getElementById(STYLE_ID);
            if (st && st.parentNode) st.parentNode.removeChild(st);
        },
        refresh: function () { render(); }
    };
})();
PLFUN["countdown"] = countdown;
