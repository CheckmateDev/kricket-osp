/*
*	userData.js
*	Permissions for users collection
*/

Meteor.users.allow({
  update: function (userId, doc, fields, modifier) {
    return doc._id === userId;
  },
  remove: function (userId, doc) {
    // only owner allowed action
    return doc._id === userId;
  },
})