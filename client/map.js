/*
*   map.js
*   KricketMap class - singleton type, init mapbox map
*/

KricketMap = (function() {
  var instance;

  function init() {

    function _load(){
    Session.set("mapLoaded",false);

    var myIcon = L.icon({
      iconUrl: '/img/blue_circle.svg',
      iconSize: [25, 25],
      iconAnchor: [12.5, 12.5]
    });

    var intervalHandle = null;
    var initFirstTimeLocation = false;
    var radius = 20;
    L.mapbox.accessToken = 'pk.eyJ1IjoidG9tbmFzc3IiLCJhIjoiV1FNMWpCNCJ9.Wnx5aUU14OLTMH7ifVkmDg';

    var northEast = L.latLng(-85, 180); // top left
    var southWest = L.latLng(85, -180); // bottom right
    bounds = L.latLngBounds(southWest, northEast);

    // set to mapbox.emerald id to get arabic and other languages
    instance._map = L.mapbox.map('map', 'mapbox.emerald', {
      attributionControl: false,
      zoomControl: false,
      center: [89.9, 50],
      zoom: 13,
      minZoom : 3,
      maxZoom : 15,
      maxBounds: bounds,
      tileLayer: {format: 'jpg70'}
    });
    instance._marker = L.marker(instance._map.getCenter(), {icon: myIcon,zIndexOffset:0}).addTo(instance._map);
    circle = L.circle(instance._map.getCenter(), radius);

    // tagMap control definition
    var tagMap = L.Control.extend({
      options: {
        position: 'bottomright'
      },
      onAdd: function() {
        // create container with tag-map css class
        var container = L.DomUtil.create('div', 'tag-map');
        if (Meteor.isCordova)
          L.DomEvent.addListener(container, 'touchstart', emojiAndCommentControl, this);
        else
          L.DomEvent.addListener(container, 'click', emojiAndCommentControl, this);

        return container;
      }
    });

    var myTagMap = new tagMap();
    myTagMap.addTo(instance._map);

    console.warn("Have to refactor Template.map.loadJustAtmosIfAsked()");
    //Template.map.loadJustAtmosIfAsked();

    //adds markers to map
    markersGroup = new L.MarkerClusterGroup();
    instance._map.addLayer(markersGroup);

    $('.nav-item').click(function() {
      console.log("click on nav-item");
      $('body').removeClass('active');
    });

    var locate = LocatePerson.getInstance(); 
    locate.setComponents(instance._map, instance._marker, circle);
    locate.updateMapPosition();

    Session.set("mapLoaded",true);
    console.log("map loaded");

    // wait a while that map is loaded to run our observer that add points into the map
    Meteor.setTimeout(function(){
      runObserver();
    },2000);

    runObserver = function() {
      Atmos.find().observe({
        added: function(doc) {
          addNewMarker(doc);
        },
        changed: function(newDoc, oldDoc) {
          if ((oldDoc.category != newDoc.category)||(oldDoc.icon != newDoc.icon)||(oldDoc.thumbnail!=newDoc.thumbnail)||(oldDoc.photo!=newDoc.photo)||(oldDoc.latlng.lat!=newDoc.latlng.lat)||(oldDoc.latlng.lng!=newDoc.latlng.lng)) {
            removeMarker(newDoc._id);
            addNewMarker(newDoc);
          }
        },
        removed: function(doc) {
        // if 24h over or more (depending on server calculations), then we remove anything relying this marker
        console.log("remove id : " + doc._id);
        removeMarker(doc._id);
      }
    });
    }

    addNewMarker = function(doc) {
      if (hasMarker(doc._id))
        return;

      if (!doc.latlng.lat || !doc.latlng.lng){
        console.log("Not adding a marker without coordinates");
        return;
      }

      var atmoIcon = null;
      var prefix = spritesApp.prefix();

      if (doc.typeAtmos == "emoji") {
        if (doc.icon.indexOf(".svg") == -1) {
    // we are storing this atmo with new storage
    atmoIcon = L.divIcon({
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      html: '<div class="svg-emoji-map ' + prefix + '-emoji-' + doc.category + '-' + doc.icon + ' ' + prefix + '-emoji-' + doc.category + '-' + doc.icon + '-dims"></div>'
    });
  } else {
    // old storage with svg individual calls will keep 24h latency when applied
    var motherIcon = L.Icon.extend({
      options: {
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      }
    });
    atmoIcon = new motherIcon({
      iconUrl: "/svg/markers/" + doc.icon
    });
  }
}


if (doc.typeAtmos == "photo" || doc.typeAtmos == "karmaStoreEmoji") {
  var motherIcon = L.Icon.extend({
    options: {
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    }
  });
  if (doc.thumbnail) {
    atmoIcon = new motherIcon({
      iconUrl: doc.thumbnail,
      className: doc.typeAtmos == "photo" ? 'rounded-photo' : ''
    });
  } else {
    atmoIcon = new motherIcon({
      iconUrl: "/svg/map/photo.svg"
    });
  }
}
var atmoMarker = L.marker([doc.latlng.lat, doc.latlng.lng], {
  icon: atmoIcon
});
atmoMarker.atmosId = doc._id;
// attach click event
atmoMarker.on('click', markerClick);
// and add marker to our featurelayer
markersGroup.addLayer(atmoMarker);

  function markerClick(e) {
    console.log("markerClick");
    clicks().disable();
    Template.map.selectAtmos(doc._id);
    Template.viewTagMenu.showTagMenu(doc._id);
    if (typeof(trip1) != "undefined" && Session.get("okToPassStep5") && !Session.get("okToPassStep4") && !Session.get("okToPassStep3") && !Session.get("okToPassStep1")) {
      console.log("click #btnTag next");
      Meteor.setTimeout(function() {
        trip1.next();
      }, 500);

      Session.set("okToPassStep5", false);
    }
  }
} // add New marker

removeMarker = function(atmosId) {
  console.log("marker removed : " + atmosId);
  // remove viewtag if it was selected
  if (Session.get("selectedMarker") == atmosId) {
    Template.viewTagBig.resetViewTag();
    Template.map.showMapComponents();
  }
  // remove too the marker on the map
  var layers = markersGroup.getLayers();
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].atmosId == atmosId) {
      markersGroup.removeLayer(layers[i]);
      break;
    }
  }
}

hasMarker = function(atmosId) {
  var layers = markersGroup.getLayers();
  for (var i = 0; i < layers.length; i++) {
    if (layers[i].atmosId == atmosId) {
      return true;
    }
  }
  return false;
}

LastMarker = function() {
  var layers = markersGroup.getLayers();
  return layers[layers.length - 1];
}
}

return {
  map:function(){
    return instance._map;
  },
  load:function(){
    if (!Session.get("mapLoaded"))
      _load();
  },
  marker:function(){
    return instance._marker;
  }
}

}; // init

return {
  getInstance: function() {
    if (!instance) {
      instance = init();
      instance.load();
    }

    return instance;
    } // getInstance
  };

})();