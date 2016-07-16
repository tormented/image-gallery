(function(){
	"use strict";
	function FileAPI(){
	}

	FileAPI.prototype.init = function(){
		var that = this;
		return new Promise(function(resolve, reject){
			window.webkitRequestFileSystem(window.TEMPORARY, 1024 * 1024 * 1024 * 1024 * 1024, function(fs){
				that.rootPath = fs.root.toURL();
				that.rootEntry = fs.root;
				resolve()
			}, reject);
		});
	};

	FileAPI.prototype.checkFile = function(path){
		var that = this;
		return new Promise(function(resolve, reject){
			that.rootEntry.getFile(path, {create: false}, resolve, reject);
		});
	};

	FileAPI.prototype.checkDirectory = function(path){
		var that = this;
		return new Promise(function(resolve, reject){
			that.rootEntry.getDirectory(path, {create: false}, resolve, reject);
		});
	};

	FileAPI.prototype.removeFile = function(path){
		var that = this;
		return new Promise(function(resolve, reject){
			that.rootEntry.getFile(path, {create: false}, function(result){
				result.remove(resolve, reject);
			}, reject);
		});
	};

	FileAPI.prototype.writeFile = function(path, data, type){
		var that = this;
		return new Promise(function(resolve, reject){
			that.rootEntry.getFile(path, {create: true}, function(fileEntry){
				fileEntry.createWriter(function(fileWriter){
					var bb = new Blob([data], {type: type});
					fileWriter.write(bb);
					fileWriter.onwriteend = function(){
						resolve(fileEntry);
					};
				}, reject);
			}, reject);
		});
	};

	FileAPI.prototype.updateFile = function(path, data, type){
		var that = this;
		return new Promise(function(resolve, reject){
			that.rootEntry.getFile(path, {create: false}, function(fileEntry){
				fileEntry.createWriter(function(fileWriter){
					fileWriter.truncate(0);
				}, reject);
				fileEntry.createWriter(function(fileWriter){
					var bb = new Blob([data], {type: type});
					fileWriter.write(bb);
					fileWriter.onwriteend = function(){
						resolve(fileEntry);
					};
				}, reject);
			});
		});
	};

	FileAPI.prototype.readFile = function(path){
		var that = this;
		return new Promise(function(resolve, reject){
			that.rootEntry.getFile(path, {create: true}, function(fileEntry){
				fileEntry.file(function(file){
					var reader = new FileReader();
					reader.onloadend = function(evt){
						resolve(evt.target.result);
					};
					reader.readAsText(file);
				}, reject);
			}, reject);
		});
	};

	FileAPI.prototype.createDirectory = function(directoryPath){
		var that = this;
		return new Promise(function(resolve, reject){
			that.rootEntry.getDirectory(directoryPath, {create: true}, function(dirEntry){
				resolve(dirEntry);
			}, reject);
		});
	};

	window.FileAPI = FileAPI;
})();