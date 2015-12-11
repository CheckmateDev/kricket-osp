/*
*   map.js
*   Map view
*/

Session.setDefault("tapZoom", 0);
Session.setDefault("emojisLoaded", false);
Session.setDefault("atmosLoaded", false);
Session.setDefault("mapVisible", true);
Session.setDefault("keyboardOn", false);
Session.setDefault("hasAlreadyFoundAPosition", false);
Session.setDefault("zoomButton", 1);
Session.setDefault("mapLoaded",false);

var marker = null;
var map = null;

// query to observe collection events
queryAtmos = null;
var tagRenderingViewIsRemoving = false;

Meteor.startup(function() {
      // Only hide statusbar for cordova ios apps, caution on Android StatusBar cause inputs hidden by keyboard
    if (Meteor.isCordova && Platform.isIOS())
      StatusBar.hide();
});

/* Helpers */

Template.map.helpers({
  newPostsComments: function() {
    // for now we just count # of emojis, but we can count new comments

    var commentCount = Atmos.find({
      $or: [{
        createdUserId: Meteor.userId()
      }, {
        "lovedBy.userId": Meteor.userId()
      }],
      "readByFollower.userId": {
        $nin: [Meteor.userId()]
      }
    }).fetch().length;
    if (commentCount === 0) {
      Session.set("CommentCountMap", false);
      return '';
    } else {
      Session.set("CommentCountMap", true);
      return commentCount;
    }

  },
  displayKarmaSettings: function() {
    if (Session.get("displaySettings") == true) {
      return true;
    } else {
      return false;
    }
  },

  zoomButtonImage: function() {
    var zoomBtn = Session.get("zoomButton");
    if (zoomBtn == 1) {
      return '/svg/buttons/btn_zoom_house.svg';
    } else if (zoomBtn == 2) {
      return '/svg/buttons/btn_zoom_globe.svg';
    } else {
      return '/svg/buttons/btn_zoom_pin.svg';
    }
  }
});

/* Events */

Template.map.events({
  'click .button-animation': function(e) {
    // manage all animations of map buttons, on browser & mobile
    buttonAnimationWithHoverClass(e);
  },

  'click #btnZoom': function(e) {
    e.preventDefault();
    stopTrip();
    var inc = Session.get("tapZoom") + 1;
    if (inc == 1) {
      console.log("btnZoom 1");
      Session.set("zoomButton", 1);

      map.setView(marker.getLatLng(), 15);
      mixpanel.track("Globe button", {
        distinct_id: Meteor.user().username,
        "zoomLevel": "15"
      });
    };
    if (inc == 2) {
      console.log("btnZoom 2");
      Session.set("zoomButton", 2);

      map.setView(marker.getLatLng(), 10);
      mixpanel.track("Globe button", {
        distinct_id: Meteor.user().username,
        "zoomLevel": "10"
      });
    };
    if (inc == 3) {
      console.log("btnZoom 3");
      Session.set("zoomButton", 3);

      map.setView(marker.getLatLng(), 3);

      inc = 0;
      mixpanel.track("Globe button", {
        distinct_id: Meteor.user().username,
        "zoomLevel": "5"
      });
    };
    Session.set("tapZoom", inc);
  },
  'click #btnTag': function(e) {
    clicks().disable();
    clicks().enable(800);

    e.preventDefault();
    // remove cordova iframe generated empty tags
    $('iframe[src="gap://ready"]').remove();
    Meteor.setTimeout(function() {
      emojiAndCommentControl();
      Template.viewAtmospheres.showAtmosphere();
        if (typeof(trip1) != "undefined" && Session.get("okToPassStep1")) {
          console.log("click #btnTag next");
          trip1.next();
          Session.set("okToPassStep1", false);
        }
      Template.map.hideMapButtons();
    }, 800);
  },
  'click #btnSearch': function(e) {
    e.preventDefault();
    stopTrip();
    swal({
      title: i18n("feature-coming"),
      text: i18n("what-looking-for"),
      type: 'input',
      showCancelButton: true,
      closeOnConfirm: true,
      animation: "slide-from-top"
    }, function(searchValue) {
      console.log("You wrote", searchValue);
      // Store history of search
      Meteor.users.update({
        _id: Meteor.userId()
      }, {
        $addToSet: {
          searchVal: {
            createdDate: new Date(),
            value: searchValue
          }
        }
      });
    });
  },
  'click #btnKarma': function(e, i) {
    clicks().disable();
    e.preventDefault();
    // toggle karma
    // remove cordova iframe generated empty tags
    $('iframe[src="gap://ready"]').remove();

    var karma = !Session.get("karmaOn");
    Session.set("karmaOn");
    if (karma) {
      mixpanel.track("User check karma", {
        distinct_id: Meteor.user().username
      });
      setTimeout(function() {
        Template.map.showKarmaView();
        Template.viewPosts.init();
        $('#postViewDetail').show();

      }, 500);

    }
  },
  'click #btnSettings': function() {
    clicks().disable();
    console.log("Showing Map Menu Left");
    stopTrip();
    setTimeout(function() {
      Template.viewMapMenuLeft.showMapMenuLeft();
      Template.menuGeneral.showMenuGeneral();
    }, 500);
  },
});

/* Methods */

Template.map.showAtmosphere = function() {
  console.log("showAtmosphere");
  $("#viewAtmosphereContainer").show();
  Template.map.hideMapComponents();
}


Template.map.showKeyboardMap = function() {
  console.log("showKeyboardMap");
  Session.set("keyboardOn", true);
  $(".keyBoardMap").addClass("active");
}

Template.map.hideKeyboardMap = function() {
  $(".keyBoardMap").removeClass("active");
  Session.set("keyboardOn", false);
}

Template.map.showViewComment = function() {
  console.log("showViewComment");
  // $(".viewComment").addClass('animated fadeIn');
  $(".viewComment").show();
}

Template.map.hideViewComment = function() {
  console.log("hideViewComment");
  $(".tag-emoji").hide();
}

Template.map.showKarmaView = function() {
  console.log("showKarmaView");
  // $("#karmaView").addClass('animated fadeIn').removeClass('fadeOut');
  var parent = document.getElementById("map-container");
  Template.map.hideMapComponents();
  if (karmaRenderingView)
    $("#karmaView").removeClass('slideOutRight').addClass('slideInRight').show();
  else
    karmaRenderingView = Blaze.render((Template.usersKarma), parent);

    // here slideInRight take ~1s to display completely (animated css class, so we delay for 1s the clicks).
    clicks().enable(700);

}

Template.map.hideKarmaView = function() {
  console.log("hideKarmaView");
  Meteor.setTimeout(function() {
    $('#karmaView').hide()
  }, 500);
  $("#karmaView").removeClass('slideInRight').addClass('slideOutRight');

}

Template.map.showSettingsView = function() {
  console.log("showSettings")
  $("#settingsView").show();
};


Template.map.showMapButtons = function() {
  console.log("showMapButtons");
  Meteor.setTimeout(function() {
    $(".mapButtons").addClass('fadeInUp').removeClass('fadeOutDown').show();
  }, 200);
}
Template.map.hideMapButtons = function() {
  console.log("showMapButtons");
  Meteor.setTimeout(function() {
      $(".mapButtons").removeClass('fadeInUp').addClass('fadeOutDown').show();
    }, 200);
    Meteor.setTimeout(function() {
      $('.mapButtons').hide();
    }, 900);
}

Template.map.invisibleMapButtons = function() {
  console.log("map buttons are invisible");
  $(".mapButtons").hide();
}

Template.map.isMapVisible = function() {
  return Session.get("mapVisible");
}

Template.map.showMapComponents = function(avoidClick) {
  console.log("showMapComponents");
  Template.map.showMapButtons();
  Template.map.removeTagView();
  Session.set("mapVisible", true);
  // let the background goes white, we don't use camera
  $("body").removeClass("transparent");

  if (map) {
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
  }
  Template.map.hideKeyboardMap();
  Template.viewAtmospheres.reset();
  // get focus on map
  if (!avoidClick)
    $("#map").click();
  $("#map").removeClass("hide");
}

Template.map.hideMapComponents = function() {
  console.log("hideMapComponents");
  Template.map.hideMapButtons();
  Session.set("mapVisible", false);
  map.dragging.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();
}


Template.map.showVenue = function() {
  console.log('showing the venue');
  $("#tag-atmosphere").show();
}


Template.map.mapMenuCloseAll = function() {
  console.log('closing all MapMenus');
  Template.viewMapMenuLeft.hideMapMenuLeft();
  Template.menuContact.hideMenuContact();
  Template.map.showMapComponents();
};

Template.map.removeTagView = function() {
  console.log("removeTagView");

  if (!tagRenderingView || tagRenderingViewIsRemoving)
    return;
  tagRenderingViewIsRemoving = true;
  Template.viewTagBig.resetViewTag(true);
  console.log("hide tag");

  $('.viewTagBig').removeClass('slideInLeft').addClass('slideOutLeft').show();

  Meteor.setTimeout(function() {
    Blaze.remove(tagRenderingView);
    tagRenderingView = null;
    tagRenderingViewIsRemoving = false;
  }, 1000);

}



Template.map.selectAtmos = function(atmosId) {

  var atmos = Atmos.findOne(atmosId);
  if (typeof(atmos) != "undefined" && map) {
    console.log("selectAtmos ok");
    map.setView(atmos.latlng, map.getZoom());

    var parent = $("#map-container").get(0);
    Template.map.removeTagView();

    tagRenderingView = Blaze.renderWithData(Template.viewTagBig, {
      atmosId: atmosId,
      fromMap: true,
      counter:myViewTagCounter
    }, parent);
    Session.set("selectedMarker", atmosId);
    Session.set("selectedMarkerLngLat", atmosId.latlng);
    console.log("selectedMarker :" + Session.get("selectedMarker"));
    $(".tag-emoji").addClass("animated slideInLeft");
    mixpanel.track("User open Atmos message", {
      distinct_id: Meteor.user().username,
      "atmosId": atmosId,
      "icon": atmos.icon
    });
    Template.map.hideMapComponents();
    Template.viewTagBig.showViewTag();
    clicks().enable(1000);
  }
}

Template.map.loadJustAtmosIfAsked = function() {
  // only
  atmosId = Router.current().params.showAtmosId;
  if (!atmosId)
    return;
  // disable auto location centered from myLocation
  LocatePerson.getInstance().doNotCenterOnFirstLocation();

  // select atmos and center map on it
  Template.map.selectAtmos(atmosId);
}

Template.map.onCreated(function(){
  Meteor.subscribe("atmos");
});

Template.map.rendered = function() {

  marker = KricketMap.getInstance().marker();
  map =  KricketMap.getInstance().map();

  $('#map').click(function() {
    console.log("click on map");
    if (!Template.viewAtmospheres.isAtmosphereVisible() && !Template.map.isMapVisible())
      Template.viewMapMenuLeft.hideMapMenuLeft();
    Template.menuContact.hideMenuContact();
    Template.map.hideKarmaView();
    Template.map.showMapButtons();
    Template.map.showMapComponents(true);
    Template.map.removeTagView();

    $('body').removeClass('active');
  });
  Meteor.setTimeout(function(){
    // Track when user collection is ready, then launch trip if necessary
    if (!Meteor.user().profile || !Meteor.user().profile.hasSeenTuto)
      runTripTutorial();

  },2000);

};


emojiAndCommentControl = function() {
  console.log("emojiAndCommentControl");
  Template.map.removeTagView();
  if (Template.viewAtmospheres.isAtmosphereVisible()) {
    return false;
  }
  Template.map.hideMapComponents();

  Session.set("createCoords", (typeof(this.getLatLng) == "undefined" ? marker.getLatLng() : this.getLatLng()));
  Template.viewAtmospheres.showAtmosphere();
  return false;
}