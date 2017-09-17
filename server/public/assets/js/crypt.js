var Crypt = {

	conf_pass: undefined,
	user_pass: undefined,
	tmp_pass: "",

	init: function(){

		if(window.location.pathname != "/"){
			if (location.protocol != "https:"){
				document.cookie = chan.toLowerCase() + '=;path=/' + chan.toLowerCase() + ';expires=' + new Date(0).toUTCString();
			} else {
				document.cookie = chan.toLowerCase() + '=;path=/' + chan.toLowerCase() + ';secure;expires=' + new Date(0).toUTCString();
			}
		}

		try{
			conf_arr = Crypt.decrypt(Crypt.getCookie("_opt"), "_opt");
		}catch(err){
			conf_arr = Crypt.decrypt(Crypt.create_cookie("_opt"), "_opt");
		}

		if(window.location.pathname != "/"){
			try{
				Crypt.conf_pass = Crypt.decrypt(Crypt.getCookie(chan.toLowerCase()), chan.toLowerCase());
			}catch(err){
				Crypt.conf_pass = Crypt.decrypt(Crypt.create_cookie(chan.toLowerCase()), chan.toLowerCase());
			}

			Hostcontroller.change_enabled(conf_arr.remote);
			if(conf_arr.width != 100) Player.set_width(conf_arr.width);
			//if(conf_arr.name !== undefined && conf_arr.name !== "") Chat.namechange(conf_arr.name);
		}
	},

	decrypt: function(cookie, name){
		if(Crypt.getCookie(name) === undefined) {
			cookie = Crypt.create_cookie(name);
		}
		var key = btoa("0103060703080703080701") + btoa("0103060703080703080701");
		key = key.substring(0,32);
		key = btoa(key);
		var decrypted = CryptoJS.AES.decrypt(
			cookie,key,
			{
				mode: CryptoJS.mode.CBC,
				padding: CryptoJS.pad.Pkcs7
			}
		);

		return $.parseJSON(decrypted.toString(CryptoJS.enc.Utf8));
	},

	decrypt_pass: function(pass){
		var key = btoa(socket.id) + btoa(socket.id);
		key = key.substring(0,32);
		key = btoa(key);
		var decrypted = CryptoJS.AES.decrypt(
			pass,key,
			{
				mode: CryptoJS.mode.CBC,
				padding: CryptoJS.pad.Pkcs7
			}
		);

		return decrypted.toString(CryptoJS.enc.Utf8);
	},

	encrypt: function(json_formated, cookie){
		var to_encrypt = JSON.stringify(json_formated);
		var key = btoa("0103060703080703080701") + btoa("0103060703080703080701");
		key = key.substring(0,32);
		key = btoa(key);
		var encrypted = CryptoJS.AES.encrypt(
			to_encrypt,
			key,
			{
				mode: CryptoJS.mode.CBC,
				padding: CryptoJS.pad.Pkcs7
			}
		);

		var CookieDate = new Date();
		CookieDate.setFullYear(CookieDate.getFullYear( ) +1);
		if (location.protocol != "https:"){
			document.cookie = cookie+"="+encrypted.toString()+";expires="+CookieDate.toGMTString()+";path=/;";
		} else {
			document.cookie = cookie+"="+encrypted.toString()+";secure;expires="+CookieDate.toGMTString()+";path=/;";
		}
	},

	get_volume: function(){
		return Crypt.decrypt(Crypt.getCookie("_opt"), "_opt").volume;
		//return conf_arr.volume;
	},

	get_offline: function(){
		var temp_offline = Crypt.decrypt(Crypt.getCookie("_opt"), "_opt").offline;
		if(temp_offline != undefined){
			return Crypt.decrypt(Crypt.getCookie("_opt"), "_opt").offline;
		} else {
			Crypt.set_offline(false);
			return false;
		}
	},

	set_volume: function(val){
		conf_arr.volume = val;
		Crypt.encrypt(conf_arr, "_opt");
	},

	create_cookie: function(name){
		if(name == "_opt") cookie_object = {volume: 100, width: 100, remote: true, name: "", offline: false};
		else cookie_object = {passwords: {}};

		var string_it = JSON.stringify(cookie_object);
		var key = btoa("0103060703080703080701") + btoa("0103060703080703080701");
		key = key.substring(0,32);
		key = btoa(key);
		var encrypted = CryptoJS.AES.encrypt(
			string_it,
			key,
			{
				mode: CryptoJS.mode.CBC,
				padding: CryptoJS.pad.Pkcs7
			}
		);

		var CookieDate = new Date();
		CookieDate.setFullYear(CookieDate.getFullYear( ) +1);

		if (location.protocol != "https:"){
			document.cookie = name+"="+encrypted.toString()+";expires="+CookieDate.toGMTString()+";path=/;";
		} else {
			document.cookie = name+"="+encrypted.toString()+";secure;expires="+CookieDate.toGMTString()+";path=/;";
		}
		//document.cookie = name+"="+encrypted.toString()+";expires="+CookieDate.toGMTString()+";path=/;"
		//document.cookie = na"="+encrypted.toString()+";expires="+CookieDate.toGMTString()+";path=/;"
		return Crypt.getCookie(name);
	},

	set_pass: function(chan, pass){
		Crypt.conf_pass.passwords[chan] = pass;
		Crypt.encrypt(Crypt.conf_pass, chan);
	},

	remove_pass:function(chan){
		delete Crypt.conf_pass.passwords[chan];
		Crypt.encrypt(Crypt.conf_pass, chan.toLowerCase());
	},

	set_userpass: function(chan, pass) {
		Crypt.conf_pass.passwords["userpass"] = pass;
		Crypt.encrypt(Crypt.conf_pass, chan);
	},

	remove_userpass:function(chan){
		delete Crypt.conf_pass.passwords["userpass"];
		Crypt.encrypt(Crypt.conf_pass, chan.toLowerCase());
	},

	set_name:function(name){
		conf_arr.name = encodeURIComponent(name).replace(/\W/g, '');
		Crypt.encrypt(conf_arr, "_opt");
	},

	set_offline: function(enabled){
		conf_arr.offline = enabled;
		Crypt.encrypt(conf_arr, "_opt");
	},

	remove_name:function(){
		conf_arr.name = "";
		Crypt.encrypt(conf_arr, "_opt");
	},

	get_pass: function(chan){
		if(Crypt.conf_pass !== undefined) return Crypt.conf_pass.passwords[chan];
		return undefined;
	},

	get_userpass: function(chan) {
		if(Crypt.conf_pass !== undefined) return Crypt.conf_pass.passwords["userpass"];
		return "";
	},

	set_remote: function(val){
		conf_arr.remote = val;
		Crypt.encrypt(conf_arr, "_opt");
	},

	get_remote: function(val){
		return conf_arr.remote;
	},

	crypt_pass: function(pass){
		Crypt.tmp_pass = pass;
		var key = btoa(socket.id) + btoa(socket.id);
		key = key.substring(0,32);
		key = btoa(key);
		var iv = btoa(Crypt.makeiv());
		var encrypted = CryptoJS.AES.encrypt(
			pass,
			CryptoJS.enc.Base64.parse(key),
			{
				mode: CryptoJS.mode.CBC,
				padding: CryptoJS.pad.Pkcs7,
				iv: CryptoJS.enc.Base64.parse(iv),
			}
		);
		window.encrypted = encrypted;
		return encrypted.toString() + "$" + iv;
	},

	makeiv: function(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 16; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
	},

	get_width: function(){
		return conf_arr.width;
	},

	set_width: function(val){
		conf_arr.width = val;
		Crypt.encrypt(conf_arr, "_opt");
	},

	getCookie: function(name) {
		var value = "; " + document.cookie;
		var parts = value.split("; " + name + "=");
		if (parts.length == 2) return parts.pop().split(";").shift();
	}
};
