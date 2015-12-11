/*
*	emojiBar.js
*	Shortcuts categories in viewAtmosphere.
*/

var urlImg = Meteor.absoluteUrl().substring(0,Meteor.absoluteUrl().length-1);

/* Helpers */

Template.emojiBar.helpers({
	categories: function(){
		return categoriesAvailable;
	},
	isCordova: function(){
		return Meteor.isCordova;
	},
	url:function(){
		return urlImg;
	}
});

/* Events */

Template.emojiBar.events({
	'click .loadCategory':function(e,t){
		e.preventDefault();
		// emojiBar events to scroll to right position
		if (t.data.workingWith=="emojiSlider"){
			offset = searchById(this.id,categoriesAvailable).offset;
			$("#horizontalSlidee").scrollLeft(offset);
		}
		if (t.data.workingWith=="atmosSlider"){
			offset = searchById(this.id,categoriesAvailable).offset*2; // 100x100 images
			$("#verticalSlidee").scrollTop(offset);
		}
		return true;
	},

	'click #backToMap':function(e,t){
		e.preventDefault();
		if(t.data.workingWith=="emojiSlider"){
			Template.viewTagBig.resetViewTag();
			Template.map.hideKeyboardMap();
		}

		if(t.data.workingWith=="atmosSlider"){
	        mixpanel.track("User close atmosphere emojis",{distinct_id:Meteor.user().username});
			Template.map.showMapComponents();
		}
	}
});

/* Methods */

Template.emojiBar.rendered = function(){
	bindEvents();
}

Template.emojiBar.reset= function(){
	Session.set("emojiSelectedByKeyboard","");
}

bindEvents=function(){
	if (!Session.get("emojisLoaded")){
		Meteor.setTimeout(bindEvents,500);
		return;
	}
	console.log("binding events");


	$(".emoji li").unbind();
	$(".emoji li").on('click',function(){
		Session.set("emojiSelectedByKeyboard",($(this).children()[0]).id);
	});
}

searchByCategory =function(category, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].category === category) {
            return myArray[i];
        }
    }
}
searchById = function(id, myArray){
    for (var i=0; i < myArray.length; i++) {
        if (myArray[i].id === id) {
            return myArray[i];
        }
    }
}
