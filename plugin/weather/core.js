/** 天气：Open-Meteo，可拖动缩放 */
var weather = (function () {
    var BOX_ID = "weather-box";
    var STYLE_ID = "weather-style";
    var LOC_KEY = "jisuye_weather_loc";
    var wrap, body;
    var loc = null;
    var data = null;
    var editing = false;
    var loading = false;

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

    var WX = {
        0: ["☀️", "晴", "Clear"],
        1: ["🌤️", "大部晴朗", "Mainly clear"],
        2: ["⛅", "多云", "Partly cloudy"],
        3: ["☁️", "阴", "Overcast"],
        45: ["🌫️", "雾", "Fog"],
        48: ["🌫️", "雾凇", "Rime fog"],
        51: ["🌦️", "小毛毛雨", "Light drizzle"],
        53: ["🌦️", "毛毛雨", "Drizzle"],
        55: ["🌧️", "大毛毛雨", "Dense drizzle"],
        56: ["🌧️", "冻毛毛雨", "Freezing drizzle"],
        57: ["🌧️", "强冻毛毛雨", "Freezing drizzle"],
        61: ["🌧️", "小雨", "Slight rain"],
        63: ["🌧️", "中雨", "Rain"],
        65: ["🌧️", "大雨", "Heavy rain"],
        66: ["🌧️", "冻雨", "Freezing rain"],
        67: ["🌧️", "强冻雨", "Freezing rain"],
        71: ["❄️", "小雪", "Slight snow"],
        73: ["❄️", "中雪", "Snow"],
        75: ["❄️", "大雪", "Heavy snow"],
        77: ["❄️", "雪粒", "Snow grains"],
        80: ["🌦️", "阵雨", "Rain showers"],
        81: ["🌧️", "中阵雨", "Rain showers"],
        82: ["🌧️", "强阵雨", "Violent showers"],
        85: ["🌨️", "阵雪", "Snow showers"],
        86: ["🌨️", "强阵雪", "Snow showers"],
        95: ["⛈️", "雷阵雨", "Thunderstorm"],
        96: ["⛈️", "雷暴冰雹", "Thunderstorm hail"],
        99: ["⛈️", "强雷暴冰雹", "Thunderstorm hail"]
    };
    function wxInfo(code) {
        var row = WX[code] || WX[Math.floor(code / 10) * 10] || ["☁️", "天气", "Weather"];
        return { icon: row[0], text: isEn() ? row[2] : row[1] };
    }

    function injectStyle() {
        if (document.getElementById(STYLE_ID)) return;
        var s = document.createElement("style");
        s.id = STYLE_ID;
        s.textContent = [
            "#weather-box{background:var(--widget-bg);border:1px solid var(--widget-bd);border-radius:var(--radius);box-shadow:var(--shadow);color:var(--widget-fg);font-size:12px;container-type:size;}",
            "#weather-box .wt-bar{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 10px;background:var(--widget-bar);font-weight:600;flex-shrink:0;}",
            "#weather-box .wt-city{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
            "#weather-box .wt-city-input{flex:1;min-width:0;border:1px solid var(--widget-bd);border-radius:4px;padding:2px 6px;font-size:12px;background:var(--input-bg);color:var(--input-fg);}",
            "#weather-box .wt-ico-btn{border:0;background:transparent;color:var(--widget-accent);cursor:pointer;padding:0 2px;font-size:14px;}",
            "#weather-box .wt-main{display:flex;align-items:center;gap:10px;padding:8px 12px 4px;flex:1;min-height:0;}",
            "#weather-box .wt-icon{font-size:clamp(28px, 22cqmin, 52px);line-height:1;}",
            "#weather-box .wt-temp{font-size:clamp(22px, 18cqmin, 40px);font-weight:600;font-variant-numeric:tabular-nums;line-height:1.1;}",
            "#weather-box .wt-desc{color:var(--widget-muted);margin-top:2px;}",
            "#weather-box .wt-meta{padding:0 12px 6px;color:var(--widget-muted);font-size:11px;}",
            "#weather-box .wt-days{display:flex;gap:6px;padding:6px 10px 10px;border-top:1px dashed var(--widget-bd);flex-shrink:0;}",
            "#weather-box .wt-days div{flex:1;text-align:center;background:color-mix(in srgb, var(--widget-accent) 12%, transparent);border-radius:6px;padding:4px 2px;min-width:0;}",
            "#weather-box .wt-days b{display:block;font-size:11px;color:var(--widget-muted);}",
            "#weather-box .wt-days span{display:block;font-size:16px;line-height:1.3;}",
            "#weather-box .wt-days em{display:block;font-style:normal;font-variant-numeric:tabular-nums;color:var(--widget-fg);font-size:11px;}",
            "#weather-box .wt-msg{padding:18px 12px;text-align:center;color:var(--widget-muted);cursor:pointer;}",
            "@container (max-height: 132px){#weather-box .wt-days{display:none;}}",
            "@container (max-height: 108px){#weather-box .wt-meta{display:none;}}"
        ].join("");
        document.head.appendChild(s);
    }

    function saveLoc() {
        try { localStorage.setItem(LOC_KEY, JSON.stringify(loc)); } catch (e) {}
    }
    function loadLoc() {
        try { loc = JSON.parse(localStorage.getItem(LOC_KEY) || "null"); } catch (e) { loc = null; }
        if (!loc || typeof loc.lat !== "number") loc = null;
    }

    function dayLabel(i, iso) {
        if (i === 0) return t("wxToday", "今");
        if (i === 1) return t("wxTmr", "明");
        if (i === 2) return t("wxAfter", "后");
        if (!iso) return "";
        var p = iso.split("-");
        return parseInt(p[1], 10) + "/" + parseInt(p[2], 10);
    }

    function render() {
        if (!body) return;
        if (typeof pluginWidgetSync === "function" && wrap) pluginWidgetSync(wrap);
        if (editing) {
            body.innerHTML =
                '<div class="wt-bar" data-drag>' +
                    '<input class="wt-city-input" data-no-drag id="wt-city-input" maxlength="30" placeholder="' + t("wxCityPh", "输入城市名") + '">' +
                    '<button type="button" class="wt-ico-btn" data-act="city-ok" data-no-drag>OK</button>' +
                "</div>" +
                '<div class="wt-msg">' + t("wxCityPh", "输入城市名") + "</div>";
            var inp = document.getElementById("wt-city-input");
            if (inp) {
                inp.value = loc && loc.name ? loc.name : "";
                setTimeout(function () { inp.focus(); inp.select(); }, 0);
                inp.addEventListener("keydown", function (e) {
                    if (e.key === "Enter") { e.preventDefault(); searchCity(inp.value); }
                    if (e.key === "Escape") { editing = false; render(); }
                });
            }
            return;
        }
        if (loading && !data) {
            body.innerHTML = '<div class="wt-msg">' + t("wxLoading", "正在获取天气…") + "</div>";
            return;
        }
        if (!data || !data.current) {
            body.innerHTML = '<div class="wt-msg" data-act="refresh">' + t("wxFail", "天气获取失败，点击重试") + "</div>";
            return;
        }
        var cur = data.current;
        var info = wxInfo(cur.weather_code);
        var name = (loc && loc.name) || t("wxLocal", "本地");
        var days = "";
        if (data.daily && data.daily.time) {
            var n = Math.min(3, data.daily.time.length);
            for (var i = 0; i < n; i++) {
                var di = wxInfo(data.daily.weather_code[i]);
                days += "<div><b>" + dayLabel(i, data.daily.time[i]) + "</b><span>" + di.icon +
                    "</span><em>" + Math.round(data.daily.temperature_2m_max[i]) + "/" +
                    Math.round(data.daily.temperature_2m_min[i]) + "°</em></div>";
            }
        }
        body.innerHTML =
            '<div class="wt-bar" data-drag><span class="wt-city" data-act="city" title="' + t("wxCityPh", "输入城市名") + '">' +
            name + '</span><button type="button" class="wt-ico-btn" data-act="refresh" data-no-drag>↻</button></div>' +
            '<div class="wt-main"><div class="wt-icon">' + info.icon + "</div><div><div class=\"wt-temp\">" +
            Math.round(cur.temperature_2m) + "°</div><div class=\"wt-desc\">" + info.text + "</div></div></div>" +
            '<div class="wt-meta">' + t("wxHum", "湿度") + " " + Math.round(cur.relative_humidity_2m) + "% · " +
            t("wxWind", "风") + " " + Math.round(cur.wind_speed_10m) + "km/h · " +
            t("wxFeel", "体感") + " " + Math.round(cur.apparent_temperature) + "°</div>" +
            (days ? '<div class="wt-days">' + days + "</div>" : "");
    }

    function fetchWeather() {
        if (!loc) return;
        loading = true;
        render();
        var url = "https://api.open-meteo.com/v1/forecast?latitude=" + loc.lat +
            "&longitude=" + loc.lon +
            "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature" +
            "&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3";
        fetch(url).then(function (r) { return r.json(); }).then(function (json) {
            loading = false;
            data = json;
            render();
        }).catch(function () {
            loading = false;
            data = null;
            render();
        });
    }

    function searchCity(name) {
        name = (name || "").trim();
        if (!name) { editing = false; render(); return; }
        loading = true;
        editing = false;
        render();
        var lang = isEn() ? "en" : "zh";
        fetch("https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(name) + "&count=1&language=" + lang)
            .then(function (r) { return r.json(); })
            .then(function (json) {
                if (json && json.results && json.results[0]) {
                    var c = json.results[0];
                    loc = { lat: c.latitude, lon: c.longitude, name: c.name + (c.admin1 ? " " + c.admin1 : "") };
                    saveLoc();
                    fetchWeather();
                } else {
                    loading = false;
                    data = null;
                    render();
                }
            })
            .catch(function () {
                loading = false;
                data = null;
                render();
            });
    }

    function ipLoc(cb) {
        fetch("https://ipwho.is/").then(function (r) { return r.json(); }).then(function (d) {
            if (d && d.success && typeof d.latitude === "number") {
                cb({ lat: d.latitude, lon: d.longitude, name: d.city || t("wxLocal", "本地") });
            } else cb({ lat: 39.9, lon: 116.4, name: isEn() ? "Beijing" : "北京" });
        }).catch(function () {
            cb({ lat: 39.9, lon: 116.4, name: isEn() ? "Beijing" : "北京" });
        });
    }

    function detectLoc(cb) {
        if (loc && typeof loc.lat === "number") { cb(loc); return; }
        var done = false;
        function finish(v) { if (done) return; done = true; cb(v); }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (p) {
                finish({ lat: p.coords.latitude, lon: p.coords.longitude, name: t("wxLocal", "本地") });
            }, function () { ipLoc(finish); }, { timeout: 4000, maximumAge: 6 * 3600000 });
            setTimeout(function () { if (!done) ipLoc(finish); }, 4500);
        } else ipLoc(finish);
    }

    function onClick(e) {
        if (wrap && wrap._plDragged) return;
        var actEl = e.target.closest("[data-act]");
        var act = actEl && actEl.getAttribute("data-act");
        if (act === "city") { editing = true; render(); return; }
        if (act === "city-ok") {
            var inp = document.getElementById("wt-city-input");
            searchCity(inp ? inp.value : "");
            return;
        }
        if (act === "refresh") { fetchWeather(); }
    }

    return {
        init: function () {
            this.uninit();
            loadLoc();
            injectStyle();
            var ui = pluginMountWidget(BOX_ID, {
                minW: 200, minH: 88, maxW: 520, maxH: 360,
                def: { left: 12, top: 88, width: 260, height: 168 }
            });
            wrap = ui.wrap;
            body = ui.body;
            wrap.addEventListener("click", onClick);
            loading = true;
            render();
            detectLoc(function (v) {
                loc = v;
                saveLoc();
                fetchWeather();
            });
        },
        uninit: function () {
            if (wrap) wrap.removeEventListener("click", onClick);
            pluginUnmountWidget(BOX_ID);
            wrap = body = null;
            data = null;
            editing = false;
            var st = document.getElementById(STYLE_ID);
            if (st && st.parentNode) st.parentNode.removeChild(st);
        },
        refresh: function (reason) {
            if (reason === "day" && !editing) fetchWeather();
            else render();
        }
    };
})();
PLFUN["weather"] = weather;
