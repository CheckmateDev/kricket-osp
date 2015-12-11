/*
*	viewAtmospheresCamera.js
*	View handler for camera view and emoji view
*/

atmosRenderingView = null;
Session.setDefault("atmosphereVisible",false);
Session.setDefault("selectedTab","emoji");
myCamera = new camera("liveVideo","canvas","preview");

/* Helpers */

Template.viewAtmospheres.helpers({
	isCordova:function(){
		return Meteor.isCordova;
	},selectedTab:function(tab){
		return Session.get("selectedTab") == tab;
	}
})

/* Events */

Template.viewAtmospheres.events({
	'click #tabEmoji':function(e){
		console.log("tabEmoji selected");
		e.preventDefault();
		Session.set("selectedTab","emoji");
		myCamera.pause();
		$("#viewAtmosphereContainer #emojis").show();
		$("#viewAtmosphereContainer #photos").hide();
	},
	'click #tabPhoto':function(e){
		console.log("tabPhoto selected");
		e.preventDefault();
		stopTrip();
		Session.set("selectedTab","photo");

		$("#viewAtmosphereContainer #emojis").hide();
		$("#viewAtmosphereContainer #photos").show();
		if (Session.get("img")=="")
			myCamera.play(function(){
				Session.set("cameraStarted", myCamera.cameraIsVisible());
				
				if (Meteor.isCordova){
					Meteor.setTimeout(function(){
						$(".content").css("display","none");
					},100);
					Meteor.setTimeout(function(){
						$(".content").css("display","block");
					},200);
				}
			});
	},

	'click #btnCloseAtmosphere' :function(e) {
		stopTrip();
		Template.viewAtmospheres.hideAtmosphere();
		// $('.vibeIcon').removeClass('animated fadeInDown');
	}
});

/* Methods */

Template.viewAtmospheres.reset=function(){
	$("#"+Session.get('currentVibe')).removeClass("nofade");
	Session.set("createCoords","")
	Session.set("currentVibe","");
	Session.set("currentCategory","");

}

Template.viewAtmospheres.hideAtmosphere	= function(){
	$("#viewAtmosphereContainer").hide();
	console.log("fadeOut AtmosphereView");
	Session.set('selectedTab', 'emoji');
	// for next time
	Meteor.setTimeout(function(){
		$("#viewAtmosphereContainer #emojis").show();
		$("#viewAtmosphereContainer #photos").show();
		hideTellYourMind();
		Session.set("atmosphereVisible",false);
		if (Meteor.isCordova)
			myCamera.pause();
		else
			myCamera.stop();
	},2000 );

	Template.map.showMapButtons();
	Template.map.showMapComponents();
	// and invalidate size to avoid tiles not loading due to hide of map
	KricketMap.getInstance().map().invalidateSize(); 
}

Template.viewAtmospheres.showAtmosphere	= function(){
	console.log("show atmosphere");
	mixpanel.track("User open atmosphere emojis",{distinct_id:Meteor.user().username});
	// let the background goes transparent, we use camera and we need to get it displayed (only if transparent backgroung)
	$("body").addClass("transparent");
	
	var parent = document.getElementById("map-container");
	if(!atmosRenderingView)
		atmosRenderingView = Blaze.render((Template.viewAtmospheres), parent);
	else{
		$("#viewAtmosphereContainer").show();;
	}
	Session.set("atmosphereVisible",true);
	clicks().enable();
}

Template.viewAtmospheres.isAtmosphereVisible = function(){
	return Session.get("atmosphereVisible");
}
