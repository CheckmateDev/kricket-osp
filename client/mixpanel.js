/*
* 	mixpanel.js
*	Mixpanel statistics
* 	Send mixpanel events when mobile device go into pause/resume event
*/

if (Meteor.isCordova){
	// call mixpanel if device has screen turned off
	document.addEventListener("pause", function(){
		var username = {};
		if (Meteor.user())
			username = {distinct_id : Meteor.user().username};
		mixpanel.track("Screen turned off",username);
	}, false);

	// call mixpanel if device has screen turned on
	document.addEventListener("resume", function(){
		var username = {};
		if (Meteor.user())
			username = {distinct_id : Meteor.user().username};
		mixpanel.track("Screen turned on",username);
	}, false);
}