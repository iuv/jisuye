// 原生 GET 请求
function get(url, callback) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (callback) callback(data);
        })
        .catch(error => {
            console.error('GET request failed:', error);
        });
}

ip = {
		exe : function(){
			const el = document.getElementById(_IN_);
			var src = el ? el.value.trim() : "";
			_MAIN_["saveHistory"]("IP地址解析", "ip", "");
			get(
					'../t/getIpMsg?ip='+src,
					function(data){
						var _ips = "";
						if (data.code == 0){
							var rs = data.data;
							_ips = '详细信息：\nIP：'+src+'\n详细地址：'+rs.country+' '+rs.region + ' '+rs.city+' '+rs.county +'\n服务商：'+rs.isp;
						} else {
							_ips = '没有找到匹配的 IP 地址信息！';
						}
						var base = data.base;
						if(base.code == 0){
							rs = base.data;
							_ips += '\n\n\n本地IP 详细信息：\nIP：'+rs.ip+'\n详细地址：'+rs.country+' '+rs.region + ' '+rs.city+' '+rs.county +'\n服务商：'+rs.isp;
						}
						_MAIN_["sysPrint"](_OUT_,_ips);
					});
		}
};
_MAIN_["ip"] = ip ;