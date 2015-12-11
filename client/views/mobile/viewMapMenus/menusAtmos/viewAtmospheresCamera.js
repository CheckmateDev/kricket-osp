/*
*	viewAtmospheresCamera.js
*	View displaying camera in viewAtmosphere View
*/

Session.setDefault("cameraStarted",true);
Session.setDefault("img","");
Session.setDefault("cameras",[]);

/* Helpers */

Template.viewAtmospheresCamera.helpers({
	isCordova:function(){
		return Meteor.isCordova;
	},
	cameraStarted:function(){
		return Session.get("cameraStarted");
	},
	photoTaken:function(){
		return Session.get("img");
	},
	manyCameras:function(){
		if (myCamera.getCameras().length==0)
			myCamera.searchForCameras(function(cams){
				Session.set("cameras",cams);
			});
		return Meteor.isCordova || (Session.get("cameras").length > 1);
	},
	nocam:function(){
		return Session.get("cameras").length == 0;
	}
});

/* Events */

Template.viewAtmospheresCamera.events({
	'click #btnSwitch' :function(){
		console.log("btnSwitch");
		//myCamera.enablePhoto();
		myCamera.switchCamera();
		Session.set("cameraStarted", myCamera.cameraIsVisible());
	},
	'click #btnTapPhoto' : function(e){
		e.preventDefault();
		console.log("btnTapPhoto");
		myCamera.takePicture(function(content){
			Session.set("img",content);
			Session.set("cameraStarted", myCamera.cameraIsVisible());
		});
		$("#liveVideo").hide();
		$("#canvas").show();

		$(".photo-vibe").velocity({
		    opacity: 0,
		    delay:1
		}).velocity({
		    duration: 400,
		    easing: "swing",
		    opacity:1
		});

	},
	'click #btnCancelPhoto' : function(){
		console.log("btnCancelPhoto");
		$("#liveVideo").show();
		$("#canvas").hide();
		if (Session.get("img")!=""){
			myCamera.play();
			Session.set("img","");
			Session.set("cameraStarted", myCamera.cameraIsVisible());
		}else{
			$("#preview").attr("src","");
			Template.viewAtmospheres.hideAtmosphere();
			myCamera.disablePhoto();
			Template.viewAtmospheres.reset();
			Template.map.showMapButtons();
		}
	},
	'click #btnSendPhoto' :function(){
		console.log("btnSendPhoto");
		tellTheWorldInPictures();
	},
    'keyup #photo_vibe': function (e, t) {
        if (e.which === 13) {
            tellTheWorldInPictures();
        }
    }
});

/* Methods */

tellTheWorldInPictures=function(){
	var vibe = $("#photo_vibe").val();
	$("#photo_vibe").val("");
	var latlng = Session.get("createCoords");

	var mobileOrientation=0;
	if (Meteor.isCordova)
		mobileOrientation = orientation+270;


	Meteor.call("insertPhotoAtmos",latlng,Session.get("img"),vibe,mobileOrientation,function(err){
		if (err) console.log("click #btnSendPhoto error : "+err);
	});
	$("#preview").attr("src","");
	Meteor.setTimeout(function() {
		Session.set("img","");
		$("#liveVideo").show();
		$("#canvas").hide();
		myCamera.pause();
		Session.set("cameraStarted", myCamera.cameraIsVisible());
		Template.map.showMapComponents();
		Template.viewAtmospheres.hideAtmosphere();

	}, 500);
}