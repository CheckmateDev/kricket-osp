/*
*   camera.js
*   Camera class is used for both browser and mobile device (IOS/Android) via cordova package
*/

camera = function(videoTag,canvasTag,previewTag){
	this._cameraIsStarted = false;
	this._cameras = [];
	this._videoStream = null;
	this._videoTag = videoTag;
	this._canvasTag = canvasTag;
	this._previewTag = previewTag;
	this._currentCam = 0;
	this._cameraRearFrontCordova = "rear";
	this._video=null;
	this._videoObj=null;
	this._callbackPictureTaken = null;
	this._cameraIsVisible = false;
	this._wakeUpCameraNextTime = false;
	this._initDone = false;


	// if orientation change, then re-init camera preview
	var self = this;

	if(Meteor.isCordova){
		document.addEventListener("resume", function(e) {
			console.log("resume event :"+JSON.stringify(e));
			if (self._wakeUpCameraNextTime){
				self.enablePhoto();
				self._wakeUpCameraNextTime = false;
		  	}
		});
		document.addEventListener("pause", function(e) {
			console.log("pause event :"+JSON.stringify(e));	
			if (self._cameraIsStarted){
				self._wakeUpCameraNextTime = true;
				self.stop();
			}
		});
		window.addEventListener('orientationchange', 
		function(){
			console.log("orientationchange");
			if (self._cameraIsStarted){
				self.stop();
				self.enablePhoto();
			}
			KricketMap.getInstance().map().invalidateSize(); 

		});

		document.addEventListener('deviceready', function(){
			console.log("deviceready event");		
			self.initCamera();
		}, false);
	}

// Create an handler that will be called when a picture is taken.
// CORDOVA ONLY
	this.initCamera = function(){
		// no need to re-init if already done.
		if (this._initDone)
			return;

		this._initDone = true;
		console.log("camera initCamera");
		if (Meteor.isCordova){
			// Init camera before use
			console.log("Before setOnPictureTakenHandler : " + moment().format("hh:mm:ss:SSSS"));
			cordova.plugins.camerapreview.setOnPictureTakenHandler(function(result){
				console.log("Inside setOnPictureTakenHandler : " + moment().format("hh:mm:ss:SSSS"));
				// App.accessRule('*', { external: true }); is used there

				// IOS result by example : assets-library://asset/asset.JPG?id=A995307F-8AE0-4E0B-8536-C315F0ED5FD4&ext=JPG
				var fileResult ="";
				if (result[0].indexOf("assets-library")!=-1){
					fileResult = result[0];
				}else
					fileResult = "file://"+result[0];
				window.resolveLocalFileSystemURL(fileResult,
				// success callback; generates the FileEntry object needed to convert to Base64 string
					function (fileEntry) {
						// convert to Base64 string
						function win(file) {
							var reader = new FileReader();
							reader.onloadend = function (evt) {
								var obj = evt.target.result; // this is your Base64 string
								$("#"+self._previewTag).attr("src",obj);
								self._callbackPictureTaken(obj);
								console.log("Inside onloadend : " + moment().format("hh:mm:ss:SSSS"));
							};
							reader.readAsDataURL(file);
							self.disablePhoto();
						};

						var fail = function (evt) { };
						fileEntry.file(win, fail);
					},
					// error callback
					function (err){
						console.log(JSON.stringify(err));
					}
					);
			});
		}
	}; //initCamera

	// Getter Cameras
	// Sync method
	// WEB BROWSER ONLY
	this.getCameras = function(){
		return this._cameras;
	}

	this.cameraIsVisible = function(){
		return this._cameraIsVisible;
	}

	// Search for current plugged cameras (does'nt work for all browsers)
	// WEB BROWSER ONLY
	this.searchForCameras = function(callback){
		if (Meteor.isCordova)
			return;
		console.log("camera searchForCameras");

		if (this._cameras.length==0){
			// get all cams in html5
			if (typeof MediaStreamTrack === 'undefined' || typeof MediaStreamTrack.getSources === 'undefined') {
				console.log('This browser does not support MediaStreamTrack.\n\nTry Chrome.');
			} else {
				var self = this;
				MediaStreamTrack.getSources(gotCams);
			}

			function gotCams(sourceInfos) {
				var cameras = [];
				for (var i = 0; i !== sourceInfos.length; ++i) {
					var sourceInfo = sourceInfos[i];
					if (sourceInfo.kind === 'video')
						cameras.push(sourceInfo.id);
				}
				self._cameras = cameras;
				callback(cameras);
			}
		}

	};

	this.toggleRearFront = function(){
		console.log("camera toggleRearFront");

		if (Meteor.isCordova){
			console.log("Before switchCamera : " + moment().format("hh:mm:ss:SSSS"));
			cordova.plugins.camerapreview.switchCamera();
			console.log("After stopCamera : " + moment().format("hh:mm:ss:SSSS"));
			this._cameraRearFrontCordova=(this._cameraRearFrontCordova=="rear"?"front":"rear");
		}
		else
			this._currentCam = this._currentCam==0?1:0;
	}

	this.disablePhoto = function(){
		console.log("camera disablePhoto");
		if (Meteor.isCordova){
			this._cameraIsVisible = false;
			console.log("Before hide : " + moment().format("hh:mm:ss:SSSS"));
			cordova.plugins.camerapreview.hide();
			console.log("After hide : " + moment().format("hh:mm:ss:SSSS"));
			console.log("hide camera");
		}else{
			this.stop();
		}
	};

	this.stop = function(){
		console.log("camera stop");
		if(Meteor.isCordova){
			if (this._cameraIsStarted == true){
				console.log("Before stopCamera : " + moment().format("hh:mm:ss:SSSS"));
				cordova.plugins.camerapreview.stopCamera();
				console.log("After stopCamera : " + moment().format("hh:mm:ss:SSSS"));
			}
		}
		else{
			if (this._videoStream || this._video){
				if (this._videoStream){
					// _videostream now tag deprecated in webkit browser
					this._videoStream.getTracks()[0].stop();
					this._videoStream=null;
				}
				this._cameraIsVisible = false;
				this._video = null;
			}
		}

		this._cameraIsStarted = false;
		this._cameraIsVisible = false;
	}
	this.switchCamera = function(){
		console.log("camera switchCamera");
		this.toggleRearFront();
		this.enablePhoto();
	}

	this.enablePhoto = function(callback){
		//this.disablePhoto();
		console.log("camera enablePhoto");

		// force init camera each time we enable photo,
		// otherwise, event deviceready could not be always catch
		this.initCamera();

		if(Meteor.isCordova){
			$("#"+this._previewTag).hide();
			if (this._cameraIsStarted){
				console.log("cam already started, show");
				cordova.plugins.camerapreview.show();
				this._cameraIsVisible = true;
				
				if (callback)
					callback();
				return;
			}

			var tapEnabled = true; //enable tap take picture
			var dragEnabled = true; //enable preview box drag across the screen
			var toBack = true; //send preview box to the back of the webview
			var swipePosition = 85;
			var rect;
			if (orientation==0)
				rect = {x: -1, y: swipePosition, width: window.screen.width+2, height:window.screen.height+1 };
			else
				rect = {x: -1, y: swipePosition, width: window.screen.height+1 , height:window.screen.width+2};
			this.deviceOrientation = orientation;

			console.log("rect : "+JSON.stringify(rect));
			console.log("cam front/rear : "+this._cameraRearFrontCordova);

			console.log("Before startCamera : " + moment().format("hh:mm:ss:SSSS"));
			cordova.plugins.camerapreview.startCamera(rect, "rear", tapEnabled, dragEnabled, toBack);
			console.log("Atfer startCamera : " + moment().format("hh:mm:ss:SSSS"));

			// 2x switch in order to make autofocus work & detect 2 cams on Android device
			// Maybe will have to investigate in android cordova plugin to know why such blur.
			if (Meteor.isCordova ){
				if (Platform.isAndroid()){
					Meteor.setTimeout(function(){
						console.log("Before 1st switchCamera : " + moment().format("hh:mm:ss:SSSS"));
						cordova.plugins.camerapreview.switchCamera();
						console.log("After 1st switchCamera : " + moment().format("hh:mm:ss:SSSS"));
						Meteor.setTimeout(function(){
							console.log("Before 1st switchCamera : " + moment().format("hh:mm:ss:SSSS"));
							cordova.plugins.camerapreview.switchCamera();
							console.log("After 1st switchCamera : " + moment().format("hh:mm:ss:SSSS"));
						},200);
					},200);
				}
				// 	Hide for 100ms body and all to make camera working
				$("body").hide();
				Meteor.setTimeout(function(){
					$("body").show();
				},100);
				
			}	

			this._cameraIsStarted = true;
			this._cameraIsVisible = true;

			if (callback)
				callback();
		}else{
			this._cameraIsVisible = true;
			// use html5 webcam
			// credits : http://davidwalsh.name/browser-camera
			// Grab elements, create settings, etc.
			if (!this._videoStream || !myCamera._videoStream.active){
				this._video = document.getElementById(this._videoTag);
				if (this._cameras.length!=0)
					this._videoObj = { "video": {optional:[{sourceId: this._cameras[this._currentCam]}]}}
				else
					this._videoObj = { "video": true};
				var errBack = function(error) {
					console.log("Video capture error: ", error.code); 
				};

				// Put video listeners into place
				if(navigator.getUserMedia) { // Standard
					navigator.getUserMedia(this._videoObj, function(stream) {
						self._video.src = stream;
						self._videoStream = stream;
						self._video.play();
						self._cameraIsStarted = true;
					}, errBack);
				} else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
					navigator.webkitGetUserMedia(this._videoObj, function(stream){
						self._video.src = window.URL.createObjectURL(stream);
						self._videoStream = stream;
						self._video.play();
						self._cameraIsStarted = true;
					}, errBack);
				}
				else if(navigator.mozGetUserMedia) { // Firefox-prefixed
					navigator.mozGetUserMedia(this._videoObj, function(stream){
						self._video.src = window.URL.createObjectURL(stream);
						self._videoStream = stream;
						self._video.play();
						self._cameraIsStarted = true;
					}, errBack);
				}
			}
			else
				this._cameraIsStarted = true;


		}
	}

	this.play = function(callback){
		console.log("camera play");
		if (Meteor.isCordova)
			this.enablePhoto(callback);
		else{
			if (this._video){
				this._video.play();
				this._cameraIsVisible = true;	
				this._cameraIsStarted = true;	
			}
			else
				this.enablePhoto();
		}

	}

	this.pause = function(){
		console.log("camera pause");
		 if (this._video && this._video.src){
 		 	this._video.pause();
			this._cameraIsVisible = false;	
			this._cameraIsStarted = false;	
 		 }
		 if (Meteor.isCordova)
			this.disablePhoto();		
	}

	this.takePicture = function(callback){
		console.log("camera takePicture");
		var content=null;
		this._callbackPictureTaken = callback;
		if (Meteor.isCordova){
			$("#"+this._previewTag).show();
			console.log("Before takePicture : " + moment().format("hh:mm:ss:SSSS"));
			cordova.plugins.camerapreview.takePicture();
			console.log("After takePicture : " + moment().format("hh:mm:ss:SSSS"));
			this._cameraIsVisible = false;
		}
		else{
			
			var canvas = document.getElementById(this._canvasTag),
			context = canvas.getContext("2d");
			var height = $("#"+ this._videoTag).height();
			var width = $("#"+ this._videoTag).width();
			canvas.width = width;
			canvas.height = height;
			context.fillRect(0, 0, width, height);
			context.drawImage(this._video, 0, 0, width,height);
			this.pause();

			content = canvas.toDataURL("image/jpeg");
			console.log("sending : "+content);
			callback(content); // launch callback there because it's launched automatically with cordova.
		}

	}
}
