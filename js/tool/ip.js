ip = {
		exe : function(){
			var src = $("#"+_IN_).val().trim();
			_MAIN_["saveHistory"]("IP地址解析", "ip", "");
			$.get(
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