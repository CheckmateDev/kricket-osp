/*
*	viewAtmospheresEmojis.js
*	View displaying emojis in viewAtmosphere View
*/

categoriesAvailable = null;
tellMeInProgress = false;
emojisCalculated = [];


/* Helpers */

Template.viewAtmospheresEmojis.helpers({
	categories: function(){
		return categoriesAvailable;
	},
	rowOf4:function(){
		console.log("rowOf4");
		return emojisCalculated;
	},
	hasBigEmoji:function(){
		return spritesApp.tinyScreen()?"":"big";
	}

});

/* Events */

Template.viewAtmospheresEmojis.events({
	'click #btnTellYouMind':function(e){
		e.preventDefault();
		setTimeout(function(){ tellYourMind(e); }, 500);
	},
    'keypress input#newCommentInMyMind': function (e, template) {
	    if (e.which === 13) {
	        return tellYourMind(e);
	    }
	},
	'click .vibeIcon':function(e){
		if (Session.get('currentVibe'))
			$(".nofade").removeClass("nofade");

		Session.set('currentVibe', e.currentTarget.id);
		Session.set('currentCategory',$(e.currentTarget).data("category"));
		Session.set('karmaStore',$(e.currentTarget).hasClass("karmaStore"));

		$(e.currentTarget).addClass("nofade");
		showTellYourMind();
		if (typeof(trip1)!="undefined" && Session.get("okToPassStep3")&& !Session.get("okToPassStep1")){
			console.log("click .vibeIcon next");
			trip1.next();
			Session.set("okToPassStep3",false);
		}
	}
});

/* Methods */

Template.viewAtmospheresEmojis.rendered = function () {
	console.log("viewAtmospheresEmojis template rendered");
	$("#bottomBar").show();
	$("#tag-atmosphere").addClass("active");
};

Template.viewAtmospheresEmojis.forceShow=function(){
	$("#bottomBar").show();
	$("#tag-atmosphere").addClass("active");
}

Template.viewAtmospheresEmojis.calculateEmojis = function(){
	console.log("calculateEmojis start : " + new Date().getTime());
	var emojis = Emojis2.find({}, {sort: {categoryOrder:1,order:1}}).fetch();
	var prefix = spritesApp.prefix();

	for(i=0;i<emojis.length;i++){
		var obj = emojis[i];
		var cssClass = (prefix + "-emoji-"+obj.category+"-"+obj.code);
		emojisCalculated.push("<li class='col-xs-8 vibeIcon' id='"+obj.code+"' data-category='"+obj.category+"'><img src='/img/1x1.png' class='"+prefix+"-emoji-view-atmosphere"+ (spritesApp.tinyScreen()?" tinyScreen":"") +" "+cssClass+" "+ cssClass+"-dims'></li>")
	}
	emojisCalculated = emojisCalculated.join("");
	console.log("calculateEmojis end : " + new Date().getTime());
}


tellYourMind = function(e){
	e.preventDefault();
	if (tellMeInProgress)
		return;

	var message = $("#newCommentInMyMind").val();
	if(message.trim().length==0){
		swal({
			title: "",
			text: "Please enter a comment below"
		});
		console.log("message empty");
		return;
	}
	tellMeInProgress = true;
	// reset message
	$("#newCommentInMyMind").val("");

	var latlng = Session.get("createCoords");
	var icon = Session.get("currentVibe");
	var category = Session.get("currentCategory");

	// reset sessions vars
	Template.viewAtmospheres.reset();

	function callTrip(){ 
		if (typeof(trip1)!="undefined" && Session.get("okToPassStep4") && !Session.get("okToPassStep3") && !Session.get("okToPassStep1")){
	        console.log("tellYourMind next");
	        trip1.next();
	        Session.set("okToPassStep4",false);
	    }
	}

	if (Session.get("karmaStore"))
		Meteor.call('insertKarmaStoreAtmos', latlng, icon, category, message,callTrip);
	else
		Meteor.call('insertAtmos', latlng, icon, category, message,callTrip);

	hideTellYourMind();
	Template.viewAtmospheres.hideAtmosphere();
	Template.map.showMapButtons();
	tellMeInProgress = false;
}


showTellYourMind = function(){
	$("#tellYourMind").addClass("active");
}
hideTellYourMind = function(){
	$("#tellYourMind").removeClass("active");
}
