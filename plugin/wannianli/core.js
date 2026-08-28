/**
 * 万年历插件：公历月视图 + 农历/节气/节日
 * 无第三方 iframe，可开关、可卸载
 */
var wannianli = (function () {
    var BOX_ID = "wannianli-box";
    var STYLE_ID = "wannianli-style";
    var STORE_KEY = "jisuye_cal_collapsed";

    var GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
    var ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
    var ANIMAL = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
    var MONTH_CN = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "腊"];
    var WEEK_CN = ["日", "一", "二", "三", "四", "五", "六"];
    var WEEK_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var TERM_NAMES = ["小寒", "大寒", "立春", "雨水", "惊蛰", "春分", "清明", "谷雨", "立夏", "小满", "芒种", "夏至", "小暑", "大暑", "立秋", "处暑", "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"];
    var TERM_INFO = [0, 21208, 42467, 63836, 85337, 107014, 128867, 150921, 173149, 195551, 218072, 240693, 263343, 285989, 308563, 331033, 353350, 375494, 397447, 419210, 440795, 462224, 483532, 504758];
    var NSTR1 = ["日", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
    var NSTR2 = ["初", "十", "廿", "卅"];
    var SOLAR_FEST = {
        "1-1": "元旦", "2-14": "情人节", "3-8": "妇女节", "3-12": "植树节", "4-1": "愚人节",
        "5-1": "劳动节", "5-4": "青年节", "6-1": "儿童节", "7-1": "建党节", "8-1": "建军节",
        "9-10": "教师节", "10-1": "国庆", "12-24": "平安夜", "12-25": "圣诞"
    };
    var LUNAR_FEST = {
        "1-1": "春节", "1-15": "元宵", "2-2": "龙抬头", "5-5": "端午", "7-7": "七夕",
        "7-15": "中元", "8-15": "中秋", "9-9": "重阳", "12-8": "腊八", "12-23": "小年"
    };
    // 农历 1900-2100
    var LUNAR_INFO = [
        0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
        0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
        0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
        0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
        0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
        0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
        0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
        0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
        0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
        0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
        0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
        0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
        0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
        0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
        0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
        0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
        0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
        0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
        0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
        0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
        0x0d520
    ];

    var viewYear, viewMonth, selected, collapsed;
    var wrap, body;

    function t(key, fallback) {
        if (typeof i18n !== "undefined") {
            var v = i18n.t(key);
            if (v !== key) return v;
        }
        return fallback;
    }

    function isEn() {
        return typeof i18n !== "undefined" && i18n.currentLang === "en-US";
    }

    function yearDays(y) {
        var i, sum = 348;
        for (i = 0x8000; i > 0x8; i >>= 1) sum += (LUNAR_INFO[y - 1900] & i) ? 1 : 0;
        return sum + leapDays(y);
    }
    function leapMonth(y) { return LUNAR_INFO[y - 1900] & 0xf; }
    function leapDays(y) {
        if (leapMonth(y)) return (LUNAR_INFO[y - 1900] & 0x10000) ? 30 : 29;
        return 0;
    }
    function monthDays(y, m) { return (LUNAR_INFO[y - 1900] & (0x10000 >> m)) ? 30 : 29; }

    function lunarDayName(d) {
        if (d === 10) return "初十";
        if (d === 20) return "二十";
        if (d === 30) return "三十";
        return NSTR2[Math.floor(d / 10)] + NSTR1[d % 10];
    }

    function solar2lunar(y, m, d) {
        if (y < 1900 || y > 2100) return null;
        var base = new Date(1900, 0, 31);
        var obj = new Date(y, m - 1, d);
        var offset = Math.round((obj - base) / 86400000);
        var i, temp = 0;
        for (i = 1900; i < 2101 && offset > 0; i++) {
            temp = yearDays(i);
            offset -= temp;
        }
        if (offset < 0) {
            offset += temp;
            i--;
        }
        var year = i;
        var leap = leapMonth(year);
        var isLeap = false;
        for (i = 1; i < 13 && offset > 0; i++) {
            if (leap > 0 && i === leap + 1 && !isLeap) {
                --i;
                isLeap = true;
                temp = leapDays(year);
            } else {
                temp = monthDays(year, i);
            }
            if (isLeap && i === leap + 1) isLeap = false;
            offset -= temp;
        }
        if (offset === 0 && leap > 0 && i === leap + 1) {
            if (isLeap) isLeap = false;
            else {
                isLeap = true;
                --i;
            }
        }
        if (offset < 0) {
            offset += temp;
            --i;
        }
        var month = i;
        var day = offset + 1;
        var gzYear = GAN[(year - 4) % 10] + ZHI[(year - 4) % 12];
        var animal = ANIMAL[(year - 4) % 12];
        var monthName = (isLeap ? "闰" : "") + MONTH_CN[month - 1] + "月";
        var dayName = lunarDayName(day);
        return {
            year: year, month: month, day: day, isLeap: isLeap,
            gzYear: gzYear, animal: animal, monthName: monthName, dayName: dayName,
            text: monthName + dayName
        };
    }

    function getTermDay(y, n) {
        var ms = 31556925974.7 * (y - 1900) + TERM_INFO[n] * 60000;
        var off = new Date(ms + Date.UTC(1900, 0, 6, 2, 5));
        return off.getUTCDate();
    }

    function termName(y, m, d) {
        var a = (m - 1) * 2, b = a + 1;
        if (getTermDay(y, a) === d) return TERM_NAMES[a];
        if (getTermDay(y, b) === d) return TERM_NAMES[b];
        return "";
    }

    function festivals(y, m, d, lunar) {
        var list = [];
        var sf = SOLAR_FEST[m + "-" + d];
        if (sf) list.push(sf);
        if (lunar) {
            var lf = LUNAR_FEST[lunar.month + "-" + lunar.day];
            if (lf && !lunar.isLeap) list.push(lf);
            var next = new Date(y, m - 1, d + 1);
            var nl = solar2lunar(next.getFullYear(), next.getMonth() + 1, next.getDate());
            if (nl && nl.month === 1 && nl.day === 1 && !nl.isLeap) list.push("除夕");
        }
        var term = termName(y, m, d);
        if (term) list.push(term);
        return list;
    }

    function ymd(date) {
        return { y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate(), w: date.getDay() };
    }

    function sameDay(a, b) {
        return a && b && a.y === b.y && a.m === b.m && a.d === b.d;
    }

    function pad(n) { return n < 10 ? "0" + n : "" + n; }

    function injectStyle() {
        if (document.getElementById(STYLE_ID)) return;
        var css = document.createElement("style");
        css.id = STYLE_ID;
        css.textContent = [
            "#wannianli-box{font-size:12px;color:var(--widget-fg);background:var(--widget-bg);border:1px solid var(--widget-bd);border-radius:var(--radius);box-shadow:var(--shadow);container-type:size;}",
            "#wannianli-box .wl-bar{display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:var(--widget-bar);flex-shrink:0;gap:6px;}",
            "#wannianli-box .wl-bar b{font-size:13px;}",
            "#wannianli-box .wl-bar .wl-sub{color:var(--widget-muted);margin-left:6px;}",
            "#wannianli-box .wl-toggle{color:var(--widget-accent);font-size:11px;flex-shrink:0;}",
            "#wannianli-box .wl-body{padding:8px 8px 10px;flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden;}",
            "#wannianli-box .wl-nav{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;flex-shrink:0;}",
            "#wannianli-box .wl-nav button{border:0;background:var(--widget-bar);color:var(--widget-fg);border-radius:4px;padding:2px 8px;cursor:pointer;}",
            "#wannianli-box .wl-nav button:hover{filter:brightness(1.08);}",
            "#wannianli-box .wl-title{text-align:center;}",
            "#wannianli-box .wl-title .wl-y{font-weight:bold;font-size:13px;}",
            "#wannianli-box .wl-title .wl-lunar{color:var(--widget-muted);font-size:11px;margin-top:2px;}",
            "#wannianli-box .wl-week,#wannianli-box .wl-grid{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;}",
            "#wannianli-box .wl-week{flex-shrink:0;}",
            "#wannianli-box .wl-week span{color:var(--widget-muted);padding:4px 0;}",
            "#wannianli-box .wl-grid{flex:1;min-height:0;align-content:stretch;}",
            "#wannianli-box .wl-cell{padding:2px 0;border-radius:4px;cursor:pointer;min-height:0;display:flex;flex-direction:column;justify-content:center;}",
            "#wannianli-box .wl-cell:hover{background:var(--widget-bar);}",
            "#wannianli-box .wl-cell .n{display:block;font-size:clamp(11px, 8cqmin, 15px);line-height:1.2;}",
            "#wannianli-box .wl-cell .l{display:block;font-size:clamp(9px, 6cqmin, 11px);color:var(--widget-muted);line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
            "#wannianli-box .wl-cell.muted{opacity:.38;}",
            "#wannianli-box .wl-cell.weekend .n{color:var(--widget-danger);}",
            "#wannianli-box .wl-cell.today{background:var(--widget-accent);color:var(--legend-fg);}",
            "#wannianli-box .wl-cell.today .l{color:var(--legend-fg);opacity:.88;}",
            "#wannianli-box .wl-cell.sel:not(.today){outline:1px solid var(--widget-accent);}",
            "#wannianli-box .wl-cell.fest .l{color:var(--widget-danger);}",
            "#wannianli-box .wl-cell.today.fest .l{color:var(--legend-fg);}",
            "#wannianli-box .wl-detail{margin-top:8px;padding-top:8px;border-top:1px dashed var(--widget-bd);line-height:1.6;color:var(--widget-fg);flex-shrink:0;overflow:hidden;}",
            "#wannianli-box.collapsed .wl-body{display:none;}"
        ].join("");
        document.head.appendChild(css);
    }

    function buildMonthCells(y, m) {
        var first = new Date(y, m - 1, 1);
        var start = first.getDay();
        var days = new Date(y, m, 0).getDate();
        var prevDays = new Date(y, m - 1, 0).getDate();
        var cells = [];
        var i;
        for (i = 0; i < start; i++) {
            var pd = prevDays - start + 1 + i;
            var pm = m === 1 ? 12 : m - 1;
            var py = m === 1 ? y - 1 : y;
            cells.push({ y: py, m: pm, d: pd, muted: true });
        }
        for (i = 1; i <= days; i++) cells.push({ y: y, m: m, d: i, muted: false });
        while (cells.length % 7 !== 0) {
            var nd = cells.length - (start + days) + 1;
            var nm = m === 12 ? 1 : m + 1;
            var ny = m === 12 ? y + 1 : y;
            cells.push({ y: ny, m: nm, d: nd, muted: true });
        }
        return cells;
    }

    function cellInfo(c) {
        var lunar = solar2lunar(c.y, c.m, c.d);
        var fests = festivals(c.y, c.m, c.d, lunar);
        var label = "";
        if (fests.length) label = fests[0];
        else if (lunar) label = lunar.day === 1 ? lunar.monthName : lunar.dayName;
        return { lunar: lunar, fests: fests, label: label };
    }

    function render() {
        if (!body || !wrap) return;
        wrap.classList.toggle("collapsed", collapsed);
        if (typeof pluginWidgetSync === "function") pluginWidgetSync(wrap);
        var box = body;
        var today = ymd(new Date());
        if (!selected) selected = { y: today.y, m: today.m, d: today.d };
        var todayLunar = solar2lunar(today.y, today.m, today.d);
        var todayFests = festivals(today.y, today.m, today.d, todayLunar);
        var weekName = isEn() ? WEEK_EN[today.w] : ("星期" + WEEK_CN[today.w]);
        var barMain = isEn()
            ? (today.m + "/" + today.d + " " + weekName)
            : (today.m + "月" + today.d + "日 " + weekName);
        var barSub = todayLunar ? (t("calLunar", "农历") + todayLunar.text) : "";
        if (todayFests.length) barSub += " " + todayFests[0];

        var weekHead = (isEn() ? WEEK_EN : WEEK_CN).map(function (w) {
            return "<span>" + w + "</span>";
        }).join("");

        var cells = buildMonthCells(viewYear, viewMonth);
        var grid = cells.map(function (c) {
            var info = cellInfo(c);
            var cls = ["wl-cell"];
            if (c.muted) cls.push("muted");
            var dw = new Date(c.y, c.m - 1, c.d).getDay();
            if (dw === 0 || dw === 6) cls.push("weekend");
            if (sameDay(c, today)) cls.push("today");
            if (sameDay(c, selected)) cls.push("sel");
            if (info.fests.length) cls.push("fest");
            return '<div class="' + cls.join(" ") + '" data-y="' + c.y + '" data-m="' + c.m + '" data-d="' + c.d + '"><span class="n">' + c.d + '</span><span class="l">' + (info.label || "") + "</span></div>";
        }).join("");

        var selLunar = solar2lunar(selected.y, selected.m, selected.d);
        var selFests = festivals(selected.y, selected.m, selected.d, selLunar);
        var selWeek = new Date(selected.y, selected.m - 1, selected.d).getDay();
        var detail = pad(selected.m) + "-" + pad(selected.d) + " " + (isEn() ? WEEK_EN[selWeek] : ("星期" + WEEK_CN[selWeek]));
        if (selLunar) detail += " · " + t("calLunar", "农历") + selLunar.gzYear + selLunar.animal + "年 " + selLunar.text;
        if (selFests.length) detail += " · " + selFests.join(" / ");

        var firstLunar = solar2lunar(viewYear, viewMonth, 1);
        box.innerHTML =
            '<div class="wl-bar" data-drag data-act="toggle">' +
                "<div><b>" + barMain + '</b><span class="wl-sub">' + barSub + "</span></div>" +
                '<span class="wl-toggle">' + (collapsed ? t("calExpand", "展开") : t("calCollapse", "收起")) + "</span>" +
            "</div>" +
            '<div class="wl-body">' +
                '<div class="wl-nav">' +
                    '<button type="button" data-act="prev" data-no-drag>‹</button>' +
                    '<div class="wl-title"><div class="wl-y">' + (isEn() ? (viewYear + "-" + pad(viewMonth)) : (viewYear + "年" + viewMonth + "月")) + "</div>" +
                    '<div class="wl-lunar">' + (firstLunar ? (firstLunar.gzYear + firstLunar.animal + "年") : "") + "</div></div>" +
                    '<span><button type="button" data-act="today" data-no-drag>' + t("calToday", "今天") + "</button> " +
                    '<button type="button" data-act="next" data-no-drag>›</button></span>' +
                "</div>" +
                '<div class="wl-week">' + weekHead + "</div>" +
                '<div class="wl-grid">' + grid + "</div>" +
                '<div class="wl-detail">' + detail + "</div>" +
            "</div>";
    }

    function onClick(e) {
        if (wrap && wrap._plDragged) return;
        var actEl = e.target.closest("[data-act]");
        var act = actEl && actEl.getAttribute("data-act");
        if (act === "toggle") {
            collapsed = !collapsed;
            try { localStorage.setItem(STORE_KEY, collapsed ? "1" : "0"); } catch (err) {}
            render();
            return;
        }
        if (act === "prev") {
            viewMonth--;
            if (viewMonth < 1) { viewMonth = 12; viewYear--; }
            render();
            return;
        }
        if (act === "next") {
            viewMonth++;
            if (viewMonth > 12) { viewMonth = 1; viewYear++; }
            render();
            return;
        }
        if (act === "today") {
            var td = ymd(new Date());
            viewYear = td.y;
            viewMonth = td.m;
            selected = { y: td.y, m: td.m, d: td.d };
            render();
            return;
        }
        var cell = e.target.closest(".wl-cell");
        if (cell) {
            selected = {
                y: parseInt(cell.getAttribute("data-y"), 10),
                m: parseInt(cell.getAttribute("data-m"), 10),
                d: parseInt(cell.getAttribute("data-d"), 10)
            };
            if (selected.m !== viewMonth || selected.y !== viewYear) {
                viewYear = selected.y;
                viewMonth = selected.m;
            }
            render();
        }
    }

    return {
        init: function () {
            this.uninit();
            injectStyle();
            var td = ymd(new Date());
            viewYear = td.y;
            viewMonth = td.m;
            selected = { y: td.y, m: td.m, d: td.d };
            try { collapsed = localStorage.getItem(STORE_KEY) === "1"; } catch (e) { collapsed = false; }
            var ui = pluginMountWidget(BOX_ID, {
                minW: 220, minH: 36, maxW: 560, maxH: 720, expandMinH: 280,
                def: { right: 12, top: 12, width: 276, height: 380, placeH: 36 }
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
        refresh: function () {
            if (body) render();
        }
    };
})();
PLFUN["wannianli"] = wannianli;
