/** 快捷便签 */
var notes = (function () {
    var BOX_ID = "notes-box";
    var STYLE_ID = "notes-style";
    var STORE_KEY = "jisuye_notes";
    var COLLAPSE_KEY = "jisuye_notes_collapsed";
    var list = [];
    var collapsed = true;
    var adding = false;
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

    function injectStyle() {
        if (document.getElementById(STYLE_ID)) return;
        var s = document.createElement("style");
        s.id = STYLE_ID;
        s.textContent = [
            "#notes-box{background:var(--notes-bg);border:1px solid var(--notes-bd);border-radius:var(--radius);box-shadow:var(--shadow);color:var(--notes-fg);font-size:12px;}",
            "#notes-box .nt-bar{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;font-weight:600;background:var(--widget-bar);flex-shrink:0;}",
            "#notes-box .nt-actions{display:flex;align-items:center;gap:4px;margin-left:auto;}",
            "#notes-box .nt-plus{border:0;background:transparent;color:inherit;font-size:16px;line-height:1;cursor:pointer;padding:0 4px;}",
            "#notes-box .nt-toggle{font-weight:normal;color:var(--widget-accent);font-size:11px;}",
            "#notes-box .nt-body{padding:8px;flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;}",
            "#notes-box.collapsed .nt-body{display:none;}",
            "#notes-box .nt-list{flex:1;min-height:0;overflow:auto;}",
            "#notes-box .nt-item{display:flex;gap:6px;align-items:flex-start;padding:6px;margin-bottom:6px;background:var(--notes-item);border-radius:4px;}",
            "#notes-box .nt-item p{flex:1;margin:0;white-space:pre-wrap;word-break:break-word;line-height:1.45;}",
            "#notes-box .nt-item button{border:0;background:transparent;color:var(--widget-danger);cursor:pointer;padding:0 4px;}",
            "#notes-box .nt-add{display:none;flex-direction:column;gap:6px;flex-shrink:0;margin-top:6px;}",
            "#notes-box.adding .nt-add{display:flex;}",
            "#notes-box textarea{width:100%;min-height:48px;height:28%;border:1px solid var(--notes-bd);border-radius:4px;padding:6px;box-sizing:border-box;background:var(--input-bg);color:var(--input-fg);resize:vertical;}",
            "#notes-box .nt-add button{align-self:flex-end;border:0;background:var(--widget-accent);color:var(--legend-fg);border-radius:4px;padding:3px 10px;cursor:pointer;}",
            "#notes-box .nt-empty{color:var(--widget-muted);text-align:center;padding:8px 0;}"
        ].join("");
        document.head.appendChild(s);
    }

    function esc(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
        });
    }

    function render() {
        if (!body || !wrap) return;
        wrap.classList.toggle("collapsed", collapsed);
        wrap.classList.toggle("adding", adding);
        if (typeof pluginWidgetSync === "function") pluginWidgetSync(wrap);
        var items = list.map(function (n, i) {
            return '<div class="nt-item"><p>' + esc(n.text) + '</p><button type="button" data-del="' + i + '" data-no-drag>×</button></div>';
        }).join("");
        if (!items) items = '<div class="nt-empty">' + t("noteEmpty", "还没有便签") + "</div>";
        body.innerHTML =
            '<div class="nt-bar" data-drag><span data-act="toggle">' + t("pluginNotes", "快捷便签") +
            (list.length ? " (" + list.length + ")" : "") + '</span><span class="nt-actions">' +
            '<button type="button" class="nt-plus" data-act="compose" data-no-drag title="' + t("noteAdd", "添加") + '">' +
            (adding ? "×" : "+") + '</button><span class="nt-toggle" data-act="toggle">' +
            (collapsed ? t("calExpand", "展开") : t("calCollapse", "收起")) + "</span></span></div>" +
            '<div class="nt-body"><div class="nt-list">' + items + "</div>" +
            '<div class="nt-add"><textarea id="nt-input" maxlength="300" placeholder="' + t("notePlaceholder", "记一句…") +
            '"></textarea><button type="button" data-act="add" data-no-drag>' + t("noteAdd", "添加") + "</button></div></div>";
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
        var act = e.target.getAttribute("data-act") || (e.target.closest("[data-act]") && e.target.closest("[data-act]").getAttribute("data-act"));
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
                var inp = document.getElementById("nt-input");
                if (inp) inp.focus();
            }
            return;
        }
        if (act === "add") {
            var ta = document.getElementById("nt-input");
            var text = ta ? ta.value.trim() : "";
            if (!text) return;
            list.unshift({ text: text, t: Date.now() });
            if (list.length > 40) list.length = 40;
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
                minW: 180, minH: 36, maxW: 520, maxH: 640, expandMinH: 180,
                def: { left: 12, bottom: 48, width: 260, height: 240, placeH: 36 }
            });
            wrap = ui.wrap;
            body = ui.body;
            wrap.addEventListener("click", onClick);
            render();
        },
        uninit: function () {
            if (wrap) wrap.removeEventListener("click", onClick);
            pluginUnmountWidget(BOX_ID);
            wrap = body = null;
            var st = document.getElementById(STYLE_ID);
            if (st && st.parentNode) st.parentNode.removeChild(st);
        },
        refresh: function () { render(); }
    };
})();
PLFUN["notes"] = notes;
