qrcode = {
	exe : function(){
		var src = $("#"+_IN_).val();
		_MAIN_["saveHistory"]("", "", "");
		if(src){
			$("#qcode").html("<img src='http://qr.liantu.com/api.php?text="+src+"'/>")
		}
	}
};
_MAIN_["qrcode"] = qrcode ;