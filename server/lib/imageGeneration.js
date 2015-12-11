/*
*	imageGeneration.js
*	Use of gm (GraphicsMagick) node package. imageGeneration is used to produce thumbnails (used on map) or convert/resize photos
*/

var gm = Meteor.npmRequire('gm').subClass({ imageMagick: true });

imageGeneration =function(bitmap,orientation){

	this._bitmap = bitmap;
	this._timeStamp = (new Date()).getTime();
	this._tempFolder = path.join(process.env.PWD,".public/png/");
	this._width=0;
	this._height=0;
	this._ext = "";
	this._orientation = typeof(orientation)=="undefined"?0:-orientation;

	if (this._orientation)
		console.log("Image generation orientation : "+orientation);	

	this.getExt = function(){
		if (!this._bitmap)
			return;
		if (this._ext)
			return this._ext;

		var match = this._bitmap.match(/([^\/^\+]*)[\+;]/)[0];
		this._ext = match.substring(match,match.length-1);

		return this._ext;
	}

	this._decodeB64Bitmap = function(){
		if (fs.existsSync(this._b64DecodedFilePath))
			return;

		var b64Photo = this._bitmap.substring(this._bitmap.indexOf(",")+1);
		fs.writeFileSync(this._b64DecodedFilePath,base64_decode(b64Photo));
	}

	this.getThumbnail = function(callback){
		this._decodeB64Bitmap();
		var self = this;
		var _tempFile = path.join(this._tempFolder,this._timeStamp+"-t.png");
		gm(this._b64DecodedFilePath).fill('rgb(0,0,0,0)').rotate('rgb(0,0,0,0)', this._orientation).resize(30).write(_tempFile,function(err){
			var bitmap = "";
			if (err)
				console.log("getThumbnail error : " +err.message);
			else{
				bitmap = "data:image/png;base64,"+base64_encode(_tempFile);
				fs.exists(_tempFile, function (exists) {
					if(exists)
						fs.unlink(_tempFile);
				});
				fs.unlink(self._b64DecodedFilePath);
			}
			callback(bitmap,err);			
		});
	}
	
	this.getPhotoResized = function(width,height,callback){
		this._decodeB64Bitmap();
		var self = this;
		var _tempFile = path.join(this._tempFolder,this._timeStamp+"-r.png");

		gm(this._b64DecodedFilePath).density(width*20,height*20).rotate('rgb(0,0,0,0)', this._orientation).resize(width,height).write(_tempFile,function(err){
			var bitmap = "";
			if (!err){
				bitmap = "data:image/png;base64,"+base64_encode(_tempFile);
				fs.exists(_tempFile, function (exists) {
					if(exists)
						fs.unlink(_tempFile);
				});
				fs.exists(self._b64DecodedFilePath, function (exists) {
					if(exists)
						fs.unlink(self._b64DecodedFilePath);
				});
				console.log("imageGeneration getPhotoResized done");
			}
			else
				console.log("imageGeneration getPhotoResized error : "+err.message);

			if (callback)
				callback(bitmap,err);
		});
	}

	this._b64DecodedFilePath = path.join(this._tempFolder,"b64d-"+this._timeStamp+"."+this.getExt());

}