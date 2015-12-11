/*
*   userData.js
*   Publication of user collection
*/

Meteor.publish("userData", function () {
  if (this.userId) {
    return Meteor.users.find({_id: this.userId},
    {fields: {
    	'packs' : 1, 
    	'karma' : 1,
    	'notificationOnShare' : 1,
    	'notificationOnFollow' : 1,
    	'notificationOnVote' : 1,
      'searchVal':1
    }});
  } else {
    this.ready();
  }
});