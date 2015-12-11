/*
*	basic.js
*	basic template used for app
*/

/* Helpers */

Template.basic.helpers({
	cameraOn: function() {
		return (Session.get("selectedTab") == "photo");
	}
});
