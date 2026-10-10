/** 每日壁纸（Bing），遮罩保证前景可读 */
var wallpaper = (function () {
    var LAYER_ID = "wp-layer";
    var STYLE_ID = "wp-style";
    var CACHE_KEY = "jisuye_wp";
    var VEIL_KEY = "jisuye_wp_veil";
    var veil = 48;

    function injectStyle() {
        if (document.getElementById(STYLE_ID)) return;
        var s = document.createElement("style");
        s.id = STYLE_ID;
        s.textContent = [
            "#wp-layer{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;}",
            "#wp-layer .wp-img{position:absolute;inset:0;background:#333 center/cover no-repeat;transform:scale(1.04);}",
            "#wp-layer .wp-veil{position:absolute;inset:0;background:rgba(255,255,255,var(--wp-veil,.48));}",
            "body.has-wallpaper #search{position:relative;z-index:5;background:transparent;height:auto;}",
            "body.has-wallpaper #ubody{position:relative;z-index:1;}",
            "#wp-copy{position:fixed;left:16px;bottom:8px;z-index:2;font-size:11px;color:rgba(80,80,80,.85);max-width:42%;pointer-events:none;text-shadow:0 1px 1px rgba(255,255,255,.5);}",
            "@media (prefers-color-scheme: dark){",
            "#wp-layer .wp-veil{background:rgba(18,18,18,var(--wp-veil,.55));}",
            "#wp-copy{color:rgba(220,220,220,.8);text-shadow:0 1px 2px rgba(0,0,0,.5);}",
            "}"
        ].join("");
        document.head.appendChild(s);
    }

    function applyVeil() {
        document.documentElement.style.setProperty("--wp-veil", (veil / 100).toFixed(2));
        var val = document.getElementById("wpOpacityVal");
        if (val) val.textContent = veil + "%";
        var range = document.getElementById("wpOpacity");
        if (range && String(range.value) !== String(veil)) range.value = veil;
    }

    function bindOpacityRow(show) {
        var row = document.getElementById("wp-opacity-row");
        var range = document.getElementById("wpOpacity");
        if (row) row.style.display = show ? "" : "none";
        if (!show || !range) return;
        range.value = veil;
        applyVeil();
        range.oninput = function () {
            veil = parseInt(range.value, 10) || 48;
            try { localStorage.setItem(VEIL_KEY, String(veil)); } catch (e) {}
            applyVeil();
        };
    }

    function setImage(url, copyright) {
        var img = document.querySelector("#wp-layer .wp-img");
        if (img) img.style.backgroundImage = 'url("' + url + '")';
        var copy = document.getElementById("wp-copy");
        if (copy) copy.textContent = copyright || "";
    }

    function localDay() {
        var d = new Date();
        return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    }

    function loadImage(force) {
        var day = localDay();
        var cache = null;
        try { cache = JSON.parse(localStorage.getItem(CACHE_KEY) || "null"); } catch (e) { cache = null; }
        if (!force && cache && cache.day === day && cache.url) {
            setImage(cache.url, cache.copyright);
            return;
        }
        var fallback = "https://bingw.jasonzeng.dev/?resolution=1920&index=0&t=" + day;
        fetch("https://bing.biturl.top/?resolution=1920&format=json&index=0&mkt=zh-CN")
            .then(function (r) { return r.json(); })
            .then(function (data) {
                var url = (data && (data.url || data.image)) || "";
                if (!url) throw new Error("empty");
                var copyright = data.copyright || "";
                setImage(url, copyright);
                try { localStorage.setItem(CACHE_KEY, JSON.stringify({ day: day, url: url, copyright: copyright })); } catch (e) {}
            })
            .catch(function () {
                setImage(fallback, "");
            });
    }

    return {
        init: function () {
            this.uninit();
            try {
                var v = parseInt(localStorage.getItem(VEIL_KEY), 10);
                if (v >= 20 && v <= 75) veil = v;
            } catch (e) {}
            injectStyle();
            document.body.classList.add("has-wallpaper");
            var layer = document.createElement("div");
            layer.id = LAYER_ID;
            layer.innerHTML = '<div class="wp-img"></div><div class="wp-veil"></div>';
            document.body.insertBefore(layer, document.body.firstChild);
            var copy = document.createElement("div");
            copy.id = "wp-copy";
            document.body.appendChild(copy);
            applyVeil();
            bindOpacityRow(true);
            loadImage();
        },
        uninit: function () {
            document.body.classList.remove("has-wallpaper");
            document.documentElement.style.removeProperty("--wp-veil");
            bindOpacityRow(false);
            ["wp-layer", "wp-copy", STYLE_ID].forEach(function (id) {
                var el = document.getElementById(id);
                if (el && el.parentNode) el.parentNode.removeChild(el);
            });
        },
        refresh: function (reason) {
            bindOpacityRow(true);
            applyVeil();
            if (reason === "day") loadImage(true);
        }
    };
})();
PLFUN["wallpaper"] = wallpaper;
