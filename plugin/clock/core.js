/** 数字时钟 */
var clock = (function () {
    var BOX_ID = "clock-box";
    var STYLE_ID = "clock-style";
    var timer = null;
    var wrap, body;
    var WEEK_CN = ["日", "一", "二", "三", "四", "五", "六"];
    var WEEK_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    function isEn() {
        return typeof i18n !== "undefined" && i18n.currentLang === "en-US";
    }
    function pad(n) { return n < 10 ? "0" + n : "" + n; }

    function injectStyle() {
        if (document.getElementById(STYLE_ID)) return;
        var s = document.createElement("style");
        s.id = STYLE_ID;
        s.textContent = [
            "#clock-box{background:var(--widget-bg);border:1px solid var(--widget-bd);border-radius:var(--radius);box-shadow:var(--shadow);color:var(--widget-fg);container-type:size;}",
            "#clock-box .pl-body{justify-content:center;padding:8px 12px;}",
            "#clock-box .ck-time{font-size:clamp(18px, 28cqmin, 56px);line-height:1.1;font-variant-numeric:tabular-nums;letter-spacing:1px;font-weight:600;}",
            "#clock-box .ck-date{margin-top:4px;font-size:clamp(10px, 10cqmin, 16px);color:var(--widget-muted);}"
        ].join("");
        document.head.appendChild(s);
    }

    function tick() {
        if (!body) return;
        var d = new Date();
        var time = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
        var date = isEn()
            ? (d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + " " + WEEK_EN[d.getDay()])
            : ((d.getMonth() + 1) + "月" + d.getDate() + "日 星期" + WEEK_CN[d.getDay()]);
        var tEl = body.querySelector(".ck-time");
        var dEl = body.querySelector(".ck-date");
        if (tEl && dEl) {
            tEl.textContent = time;
            dEl.textContent = date;
            return;
        }
        body.innerHTML = '<div class="ck-time">' + time + '</div><div class="ck-date">' + date + "</div>";
    }

    return {
        init: function () {
            this.uninit();
            injectStyle();
            var ui = pluginMountWidget(BOX_ID, {
                minW: 120, minH: 52, maxW: 480, maxH: 240,
                drag: "all",
                def: { left: 12, top: 12, width: 168, height: 72 }
            });
            wrap = ui.wrap;
            body = ui.body;
            tick();
            timer = setInterval(tick, 1000);
        },
        uninit: function () {
            if (timer) { clearInterval(timer); timer = null; }
            pluginUnmountWidget(BOX_ID);
            wrap = body = null;
            var st = document.getElementById(STYLE_ID);
            if (st && st.parentNode) st.parentNode.removeChild(st);
        },
        refresh: function () { tick(); }
    };
})();
PLFUN["clock"] = clock;
