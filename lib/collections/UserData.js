/*
*	UserData.js
*	Subcribe to user datas shared via Meteor.users() reactive object
*/

if (Meteor.isClient){
	Meteor.startup(function(){
		Meteor.subscribe("userData");	
	});
}