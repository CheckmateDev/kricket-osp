/*
*   menuContact.js
*   View displayed when clicking at the top left Kricket icon
*/

menuContact = null;

/* Events */

Template.menuContact.events({
  'click #twitter-page': function(e) {
    e.preventDefault();
    window.open("http://twitter.com/kricketco", '_system');
  },
  'click #instagram-page': function(e) {
    e.preventDefault();
    window.open("https://instagram.com/kricketco/", '_system');
  },
  'click #angel-page': function(e) {
    e.preventDefault();
    window.open("https://angel.co/kricket-1", '_system');
  },
  'click #facebook-page': function(e) {
    e.preventDefault();
    window.open("https://www.facebook.com/kricketco?fref=ts", '_system');
  },
  'click #btnProfile': function(e) {
    e.preventDefault();
    // see usersProfile
    Template.usersProfile.showUserProfile();
  },

  'click #exit-karma-btn': function(e, tmpl) {
    console.log("hide settings page");
    if (Session.get("displaySettings") == true) {
      setTimeout(function(){ Session.set("displaySettings", false); Template.map.showMapComponents();}, 800)
    } else {
      Session.set("displaySettings", true);
    }
  },

});

/* Methods */

Template.menuContact.showMenuContact = function() {
  console.log("showing menuContact");
  var parent = document.getElementById("map-container");

  if (menuContact)
    $("#menuContactContainer").removeClass('fadeOutLeft').addClass('slideInLeft').show();
  else
    menuContact = Blaze.render((Template.menuContact), parent);
    Template.map.hideMapComponents();
}

Template.menuContact.hideMenuContact = function (){
  console.log("closing menuContact");
  Meteor.setTimeout(function() {
    $('#menuContactContainer').hide();
  }, 800);
  $("#menuContactContainer").removeClass('slideInLeft').addClass('fadeOutLeft');
};