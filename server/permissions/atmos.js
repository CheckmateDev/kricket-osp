/*
*   atmos.js
*   Permissions for atmos collection
*/

Atmos.allow({
  insert: function (userId, doc, fields) {
    // the user must be logged in, and the document must be owned by the user
    return true;
  },
  update: function (userId, doc, fields, modifier) {
    var user = Meteor.users.findOne(userId);

    return (doc.createdUserId === userId) || (user && user.profile && user.profile.role == "super-admin");
  },
  remove: function (userId, doc) {
    // only owner allowed action
    var user = Meteor.users.findOne(userId);
    return (doc.createdUserId === userId) || (user && user.profile && user.profile.role == "super-admin");
  },
});