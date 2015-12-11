/*
*   tutorial.js
*   Tutorial run at first launch of app
*/

clickAllowed = null;
trip1 = undefined;

runTripTutorial=function(){
	// if map components are not visible, go !
  console.log("runTripTutorial")
	if ($("#btnTag").length == 0 || $("#btnTag").hasClass("fadeOutDown")){
          Template.map.showMapComponents();
          Meteor.setTimeout(function(){runTrip();},2500);
    }else
		runTrip();
}

stopTrip = function(){
  if (!trip1)
    return;
  trip1.stop();
  trip1 = undefined;
  Meteor.users.update({
    _id: Meteor.userId()
  }, {
    $set: {
      'profile.hasSeenTuto': true
    }
  });
}

runTrip = function() {
  Session.set("okToPassStep1",true);
  Session.set("okToPassStep3",true);
  Session.set("okToPassStep4",true);
  Session.set("okToPassStep5",true);

  trip1 = new Trip([{
      sel: "#btnTag",
      position: 'n',
      content: i18n("trip-welcome"),
      delay: -1,
      onTripStart: function(){
      },
      onTripEnd: function() {
      }
    },
    {
      sel: 'li.vibeIcon:first-child',
      position: 'e',
      content: i18n("trip-first-emoji"),
      delay: -1,
      onTripStart:function(){
      },
      onTripEnd:function(){
      }
    }, {
      sel: '#tellYourMind',
      position: 'n',
      content: i18n("trip-comment-tell"),
      delay: -1,
      animation: 'fadeInDown',
      onTripStart:function(){
      },
      onTripEnd:function(){
      }
    }, {
      sel: '.leaflet-marker-pane>div:last-child',
      position: 'n',
      content: i18n("trip-tap-details"),
      delay: -1,
      onTripStart:function(){
      },
      onTripEnd:function(){
      }
    }, {
      sel: '#indivdual-counter',
      position: 's',
      content: i18n("trip-live-for-24"),
      delay: 3500,
      animation: 'fadeInDown'
    }, {
      sel: '#tag-karmaPointCounter>.karma-counter-text',
      position: 'w',
      content: i18n("trip-karma-earned"),
      animation: 'fadeInDown'

    },{
      sel :'#btnShare',
      position:'w',
      content : i18n("trip-share-tag"),
      animation: 'fadeInDown'

    },
    {
      sel: '#btnFollow',
      position: 'w',
      content: i18n("trip-follow-tag"),
      delay: 4500
    }, {
      sel: '#viewTagMenu .btnX',
      position: 'w',
      content: i18n("trip-close-tag"),
      onTripStart: function() {
        // click X to let map buttons grows up
        Meteor.setTimeout(function() {
          $("#viewTagMenu .btnX").click();
        }, 2000);
      },
      delay: 2500
    },{
      sel: $("#btnKarma"),
      content: i18n("trip-karma-menu"),
      delay: -1,
      position: "w",
      onTripStart: function() {
        // wait that karma menu is loaded, it will send a next()
        Meteor.setTimeout(function() {
          $("#btnKarma").click();  
        }, 2000);
        Meteor.setTimeout(function() {
          trip1.next();
        }, 3500);
      }
    }, {
      sel: "#btnMenuTag",
      content: i18n("trip-view-tags"),
      position: "w",
      onTripStart: function() {
        $(".btnMenuTag").click();
      },
      delay: 5000
    }, {
      sel: '.btnX.xKarma',
      position: 'w',
      content: i18n("trip-close-menu"),
      onTripStart: function() {
        // click X to let map buttons grows up
        Meteor.setTimeout(function() {
          $(".btnX.xKarma").click();
        }, 2000);
      },
      delay: 2500
    },{
      sel: $("#btnTag"),
      content: i18n("trip-fun"),
      position: "e",
		onTripEnd:function(){
      stopTrip();
	  }
    }


  ], {
    showNavigation: false,
    showHeader: false,
    delay: 3000,
    enableKeyBinding: false,
    animation: 'fadeInDown'
  });
  trip1.start();

}

