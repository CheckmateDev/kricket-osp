/*
*   usersKarma.js
*/


karmaRenderingView = null;
karmaPostDetailRenderingView = null;
Session.set("karmaTabSelected","tags");

/* Helpers */

Template.usersKarma.helpers({
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
  nbOfMyPosts: function() {
    return Atmos.find({
      createdUserId: Meteor.userId(),
      timeLimit: {
        $gte: new Date()
      }
    }).fetch().length;
  },
  nbOfFavoritedPosts: function() {
    return Atmos.find({
      timeLimit: {
        $gte: new Date()
      },
      "lovedBy.userId": Meteor.userId()
    }).fetch().length;
  },
  karmaTabSelected:function(tab){
    return Session.get("karmaTabSelected") == tab;
  }
});

/* Events */

Template.usersKarma.events({
  'click .btnKarmaCounter': function() {
    console.log("show karmaCounter");
    Template.viewPosts.hideViewPosts();
  },

  'click .btnMenuTag': function(e) {
    e.preventDefault();
    console.log('btnMenuTag Clicked');
    Session.set("karmaTabSelected","tags");
    Template.viewPosts.init();
    setTimeout(function() { $('#postViewDetail').show();}, 500);
  },
  'click .btnKarmaStore': function(e) {
    e.preventDefault();
    Session.set("karmaTabSelected","store");
    Template.viewPosts.hideViewPosts();
  },
  'click .xKarma': function(e) {
    e.preventDefault();
    Template.map.showMapComponents();
    Template.map.hideKarmaView();
    Template.viewPosts.hideViewPosts();
    console.log('xKarma Close all');
  },
});
