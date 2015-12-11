/*
*   viewTagMenu.js
*   Right menu
*/

viewTagMenu = null;

/* Helpers */

Template.viewTagMenu.helpers({
  currentMarker: function () {
    return Atmos.findOne(this.atmosId);
  },
  karmaCounter: function() {
    var countKarma = Meteor.user().karma;
    return $({
      countNum: 0
    }).animate({
      countNum: countKarma
    }, {
      duration: 800,
      easing: 'easeInOutCubic',
      step: function() {
        $('.karma-counter').text(Math.floor(this.countNum));
      },
      complete: function() {
        $('.karma-counter').text(this.countNum);
      }
    });
  },
  followingCounter: function() {
    var atmos = Atmos.findOne({
      _id: Session.get("selectedMarker")
    });

    if (!atmos || !atmos.lovedBy)
      return "0";
    else
      return atmos.lovedBy.length;
  },
  loved: function() {
    return Session.get("lovedByMe");
  },
  shareCounter:function(){
    // Explanations :
    // instead of using code of getAtmosProperty, we refactor to be reusable
    // Note : keep session var here as Meteor will detect updates then update
    // template in reactive way.
    return getAtmosProperty(Session.get("selectedMarker"),"shareCount");
  },
  upVoteCounter:function(){
    return getAtmosProperty(Session.get("selectedMarker"),"upvotes");
  },
  downVoteCounter:function(){
    return getAtmosProperty(Session.get("selectedMarker"),"downvotes");
  }

});

/* Events */

Template.viewTagMenu.events({
  'click #btnDownvote':function(e,t){
    Meteor.call("downvote",Session.get("selectedMarker"));
    // Template.viewKarmaCounterTag.hideViewKarmaCounterTag();
    $('#btnUpvote').removeClass('pushed-blue');
    $('#btnDownvote').addClass('pushed-blue');
    e.stopPropagation();
  },
  'click #btnUpvote':function(e,t){
    Meteor.call("upvote",Session.get("selectedMarker"));
    // Template.viewKarmaCounterTag.hideViewKarmaCounterTag();
    $('#btnUpvote').addClass('pushed-blue');
    $('#btnDownvote').removeClass('pushed-blue');
    e.stopPropagation();
  },
  'click #btnShare': function(e,t) {
    e.preventDefault();

// if we're not in cordova env, then we exit, we can't share from browser (for now)
    if(!Meteor.isCordova){
      return;
    }
    console.log("share start : "+(new Date().getTime()));
    Meteor.call("shareMessage",Session.get("selectedMarker"),function(err,urlImage){
      console.log("share message start : "+(new Date().getTime()));
      mixpanel.track("User share message",{distinct_id:Meteor.user().username, "atmosId":Session.get("selectedMarker")});
      console.log("share message mixpanel : "+(new Date().getTime()));
      var message="",url="http://kricket.co";
      if (Meteor.absoluteUrl().indexOf(":3000")!=-1){
        urlImage = 'http://www.queness.com/resources/images/png/apple_raw.png';
        message = '[Dev] Note that image is the same because storage of generated images not reachable by twitter,fb...';
      }
      else{
        urlImage = Meteor.absoluteUrl().substring(0,Meteor.absoluteUrl().length-1) + urlImage;
        message = ' #KricketApp';
      }

      Meteor.setTimeout(function(){
        console.log("share setTimeout start : "+(new Date().getTime()));
        window.plugins.socialsharing.share(message, "Amazing Kricket atmosphere !", urlImage , url);
        console.log("share setTimeout end : "+(new Date().getTime()));
        Meteor.call("sharedMessage",Session.get("selectedMarker"));
      },50);
      console.log("share end : "+(new Date().getTime()));
    });
    e.stopPropagation();
    },
  'click #btnFollow': function(e, t) {
    // toggle btn love
    var method = "";
    var atmosId = Session.get("selectedMarker");
    if (Template.viewTagMenu.isLoved(atmosId))
      method = "hateThisAtmos";
    else
      method = "loveThisAtmos";
    Meteor.call(method, atmosId, function(error, result) {
      // must be ok then
      if (!error)
        Session.set("lovedByMe", (method == "loveThisAtmos" ? true : false));
      console.log('nowFollowingThisAtmos');
      e.stopPropagation();

    });
  },
  'click .btnX': function(e) {
    e.preventDefault();
    e.stopPropagation();
    Template.viewTagMenu.closeViewTagMenu();
  },
});

/* Methods */

Template.viewTagMenu.showTagMenu = function(atmosId) {
  console.log("showing individual TagMenu");

  Session.set("selectedMarker",atmosId);
  var parent = document.getElementById("map-container");

  if (viewTagMenu)
    $("#viewTagMenu").removeClass('slideOutRight').addClass('slideInRight').show();
  else
    viewTagMenu = Blaze.render((Template.viewTagMenu), parent);
  Session.set("lovedByMe",Template.viewTagMenu.isLoved(Session.get("selectedMarker")));
};

Template.viewTagMenu.hideTagMenu = function() {
  console.log("hiding individual TagMenu");
  $("#viewTagMenu").removeClass('slideInRight').addClass('slideOutRight').show();

  // if we opened tag from map and not from tags menu (right)
  // we have to enable map components, and particularly make a click on map before
  // to enable map scrolls...
  if(Session.get("karmaTabSelected") != "tags")
    Template.map.showMapComponents();
};

Template.viewTagMenu.isLoved = function(atmosId) {

  var loved = Atmos.findOne({
    _id: atmosId,
    "lovedBy.userId": Meteor.userId()
  });

  if (typeof(loved) == "undefined")
    return false;
  return true;
};

Template.viewTagMenu.closeViewTagMenu = function(){
  Template.map.removeTagView();
  Template.viewTagMenu.hideTagMenu();

    // if PostDetails handler then we are coming from karma menu
    if (karmaPostDetailRenderingView){
      Template.viewPostsDetail.removePostViewDetail();
      Template.viewPosts.runCounters();
    }else{
      // else we are just looking at atmosphere from map
      Template.map.showMapComponents();
    }
    console.log('Close viewTag & viewTag Menu');
}

getAtmosProperty = function(atmosId,property){
  var atmos = Atmos.findOne({
    _id: atmosId
  });

  if (!atmos || !atmos[property])
    return "0";
  else
    return atmos[property];
}