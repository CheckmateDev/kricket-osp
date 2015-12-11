/*
*	pushNotification.js
*	Code to manage sending notifications from client/server side
*/

// Push configuration is in /config.push.json file
pushNotification = function(){

/*
Uses /config.push.json, refer to https://github.com/raix/push how to add more push notifications environment
*/
	if (Meteor.isServer){
		// push notification for mobile devices
		this.sendMessageTo = function(userId,title,text){
			console.log("push notification to "+userId);
			Push.send({
				from: 'Kricket',
				title: title,
				text: text,
				badge: this.getBadge(userId),
				query: {
					userId: userId
				}
			});
		}
		// how to get badge amount (will add soon loved comments)
		this.getBadge = function(userId){
			var countHowManyPostUnread = Atmos.find({"comments.readByCreator":false,"createdUserId":userId}).fetch().length;
			console.log("getBadge : "+ countHowManyPostUnread);
			return countHowManyPostUnread;
		}
	}

	if(Meteor.isClient){
		this.permissionGranted = false;

		var Notification = window.Notification || window.mozNotification || window.webkitNotification;
		var self = this;
		Notification.requestPermission(function (permission) {
			console.log(permission);
			if ((permission != 'denied') && (permission != 'default'))
				self.permissionGranted = true;
		});

		// Send message notification for web apps
		this.sendMessage = function(title,text,atmosId){
			var instance = new Notification(
				title, {
					body: text,
					icon: "http://kricket.co/images/logo.png",
					sound :"audio/ding.mp3"
				}
			);

			$("body").append('<audio autoplay="autoplay"><source src="/audio/ding.mp3"></source></audio>');
			// when clicking on notification 
			instance.onclick = function () {
				// try {
				window.focus();
				Template.map.selectAtmos(atmosId);
				// next : will open karma menu when design will be ready !
			};
			// exists too 	.onerror = function () {
			//				.onshow = function () {
			//				.onclose = function () {

		}
	}

}