/*
*	webAppNotification.js
*	Permissions for webAppNotification collection
*/

WebAppNotification.allow({
  update: function (userId, doc, fields, modifier) {
    return doc.forUserId === userId;
  },
  remove: function (userId, doc) {
    // only owner allowed action
    return doc.forUserId === userId;
  },
})