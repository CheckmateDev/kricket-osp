/*
*   viewMapMenuLeft.js
*   Manage content on left side menu
*/

menuLeftRenderingView = null;


/*  Events */

Template.viewMapMenuLeft.events({
'click #mapMenuLeftTop': function() {
  console.log("show menuContact");
  Template.menuContact.showMenuContact();
  Template.menuGeneral.hideMenuGeneral();
},
'click #btnTuto': function(e) {
  e.preventDefault();
  myLocatePerson.stop();
  Session.set("tutoStep", 0);
  Session.set("forceTutorial", true);
  if (karmaRenderingView) {
    Blaze.remove(karmaRenderingView);
    karmaRenderingView = null;
  }
  if (userProfileRenderingView) {
    Blaze.remove(userProfileRenderingView);
    userProfileRenderingView = null;
  }
  if (tagRenderingView) {
    Blaze.remove(tagRenderingView);
    tagRenderingView = null;
  }
  if (atmosRenderingView) {
    Blaze.remove(atmosRenderingView);
    atmosRenderingView = null;
  }
},
'click #btnGeneral': function() {
  console.log("show menuGeneral");
  Template.menuGeneral.showMenuGeneral();
  Template.menuContact.hideMenuContact();
},
'click #btnMenuExitLeft': function() {
  console.log("closing all menuLeft");
  Template.menuGeneral.hideMenuGeneral();
    Template.menuContact.hideMenuContact();
Template.map.mapMenuCloseAll();
}
});

/* Methods */

Template.viewMapMenuLeft.showMapMenuLeft = function() {
  console.log("showing MapMenuLeft");
  var parent = document.getElementById("map-container");

  if (menuLeftRenderingView)
    $("#mapMenuLeft").removeClass('slideOutLeft').addClass('slideInLeft').show();
  else
    menuLeftRenderingView = Blaze.render((Template.viewMapMenuLeft), parent);
    Template.map.hideMapComponents();
    clicks().enable(1000);
}

Template.viewMapMenuLeft.hideMapMenuLeft = function() {
  console.log("hiding mapMenuLeft");
  Meteor.setTimeout(function() {
    $('#viewMapMenuLeft').hide();
  }, 800);
  $("#mapMenuLeft").removeClass('slideInLeft').addClass('slideOutLeft');
}