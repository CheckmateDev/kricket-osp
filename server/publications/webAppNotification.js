/*
*	webAppNotification.js
*	Publication of web app notifications for browsers
*/

Meteor.publish("webAppNotification", function () {
    return WebAppNotification.find({forUserId:this.userId});
});