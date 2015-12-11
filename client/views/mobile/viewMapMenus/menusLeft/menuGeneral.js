/*
*   menuGeneral.js
*   View in Settings - General
*/

menuGeneral = null;

/* Helpers */

Template.menuGeneral.helpers({
  'currentUser':function(){
    return Meteor.user();
  }
})

/* Events */

Template.menuGeneral.events({
  'click #btnTuto': function(e) {
    e.preventDefault();

    Template.menuGeneral.hideMenuGeneral();
    Template.viewMapMenuLeft.hideMapMenuLeft();
    Template.map.showMapComponents();
    runTripTutorial();
  },
  'click #exit-karma-btn': function(e, tmpl) {
    console.log("hide settings page");
    if (Session.get("displaySettings") == true) {
      setTimeout(function(){ Session.set("displaySettings", false); Template.map.showMapComponents();}, 800)
    } else {
      Session.set("displaySettings", true);
    }
  },
  'click #notificationOnShare':function(e,t){
    var value=true;
    if (Meteor.user().notificationOnShare)
      value = false;
    Meteor.users.update({_id:Meteor.userId()},{$set:{notificationOnShare : value}});
  },
  'click #notificationOnFollow':function(e,t){
    var value=true;
    if (Meteor.user().notificationOnFollow)
      value = false;
    Meteor.users.update({_id:Meteor.userId()},{$set:{notificationOnFollow : value}});
  },
  'click #notificationOnVote':function(e,t){
    var value=true;
    if (Meteor.user().notificationOnVote)
      value = false;
    Meteor.users.update({_id:Meteor.userId()},{$set:{notificationOnVote : value}});
  },
  'change #preferredLanguage':function(e,t){
    Meteor.users.update({_id:Meteor.userId()},{$set:{"profile.preferredLanguage" : e.currentTarget.value}});
  }
});

/* Methods */

Template.menuGeneral.showMenuGeneral = function() {
  console.log("showing menuGeneral");
  // $("#karmaView").addClass('animated fadeIn').removeClass('fadeOut');
  var parent = document.getElementById("map-container");

  if (menuGeneral)
    $("#menuGeneralContainer").removeClass('slideOutRight').addClass('slideInRight').show();
  else
    menuGeneral = Blaze.render((Template.menuGeneral), parent);
    Template.map.hideMapComponents();

  var preferredLanguage = Meteor.user().profile.preferredLanguage;
  if (preferredLanguage)
    $("#preferredLanguage").val(preferredLanguage);
}

Template.menuGeneral.hideMenuGeneral = function (){
  console.log("closing menuGeneral");
  Meteor.setTimeout(function() {
    $('#menuGeneralContainer').hide();
  }, 1000);
  $("#menuGeneralContainer").removeClass('slideInRight').addClass('slideOutRight');
};