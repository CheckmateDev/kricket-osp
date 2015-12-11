/*
*	user.js
*	Server side methods about users
*/

Meteor.methods({
	'requestForNewEmoji' : function (req) {
		var email = Meteor.user().emails[0].address;
		emojiRequest(req,email);
	},
	'alertForOffensiveContent' : function(atmosId){
		atmosphereAlert(atmosId);
	}
});


