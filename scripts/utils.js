(function(){
	"use strict";
	function Utils(){}

	Utils.prototype.request = function(url, options){
		return new Promise(function(resolve, reject){
			var xhr = new XMLHttpRequest();
			xhr.responseType = options.type;

			if(options.type === 'arraybuffer'){
				xhr.onload = function(e){
					if(xhr.readyState === 4 && xhr.status === 200){
						resolve(xhr);
					}else{
						reject(xhr);
					}
				};
			}else{
				xhr.onreadystatechange = function(){
					if(xhr.readyState === 4 && xhr.status === 200){
						resolve(xhr);
					}else{
						reject(xhr);
					}
				};
			}
			xhr.open('GET', url, true);
			xhr.send();
		});
	};

	Utils.prototype.getHash = function(){
		return Math.random().toString(36).substring(7);
	};

	Utils.prototype.getFileAbsolutePath = function(path){
		return 'filesystem:' + window.location.origin + '/temporary' + path;
	};

	Utils.prototype.getFileRelativePath = function(path){
		var parts = path.split('/');
		return parts[parts.length - 2] + '/' + parts[parts.length - 1];
	};

	Utils.prototype.toArray = function(list){
		return Array.prototype.slice.call(list);
	};

	window.utils = new Utils();
})();