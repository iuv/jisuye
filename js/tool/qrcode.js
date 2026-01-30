qrcode = {
	exe : function(){
		const inEl = document.getElementById(_IN_);
		var src = inEl ? inEl.value : "";
		_MAIN_["saveHistory"]("", "", "");
		if(src){
			const qcodeEl = document.getElementById("qcode");
			if(qcodeEl) qcodeEl.innerHTML = "<img src='http://qr.liantu.com/api.php?text="+src+"'/>"
		}
	}
};
_MAIN_["qrcode"] = qrcode ;