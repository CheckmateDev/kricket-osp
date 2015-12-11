/*
*	WebAppNotification.js
*	Definition of webAppNotification collection
*	Launch of web notifications from a collection query
*/

WebAppNotification = null;
queryWebAppNotification = null;

Meteor.startup(function(){
	if (Meteor.isClient){
		if (!Meteor.isCordova){
			WebAppNotification = new Meteor.Collection("webAppNotification");
			Meteor.subscribe("webAppNotification");
			queryWebAppNotification = WebAppNotification.find();
			queryWebAppNotification.observe({
				added: function(doc) {
					console.log("pushing notifications");
					var not = new pushNotification();
					not.sendMessage(doc.title,doc.text,doc.atmosId);
					// say to server that we received notification.
					Meteor.call("notificationRead",doc._id);
					return true;
				}
			});
		}
	}
});

if (Meteor.isServer)
	WebAppNotification = new Meteor.Collection("webAppNotification", {connection: null});