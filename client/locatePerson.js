/*
*   locatePerson.js
*   Singleton class using geolocation to get position of user (browser or mobile device)
*/
Meteor.startup(function(){
  Session.setDefault("locationFound", false);  // Session var to know when location is found
  Session.setDefault("7seconds", false);       // if location is not found within 7s, a popup displays to user
});

LocatePerson = (function() {
  var instance;

  function init() {
      // Singleton LocatePerson
      // private methods & vars
      function onPosition(position) {
        console.log("location found - lat:" + position.coords.latitude + " lng:" + position.coords.longitude);
        if (!Session.get("locationFound"))
          Session.set("locationFound", true);  
        instance._radius = position.coords.accuracy / 2;
        instance._lat = position.coords.latitude;
        instance._lng = position.coords.longitude;

        // if map is fully loaded
        if (Session.get("mapLoaded"))
          instance.updateMapPosition(position);

      }; // onPosition

      function checkToPreventGeolocationIsOff(){
        Meteor.setTimeout(function() {
          Session.set("7seconds", true);
          if (!Session.get("hasAlreadyFoundAPosition")) {
            var message = "Allow geolocation from your browser or go to settings to allow this";
            if (Platform.isIOS())
              message = 'Go to Settings > Privacy > Location Services to enable.';
            if (Platform.isAndroid())
              message = 'Go to Settings page to enable GPS';
            swal({
              title: "Is your GPS Enabled?",
              text: message,
              type: 'warning',
              closeOnConfirm: true,
              animation: "slide-from-top"
            });
          }
        }, 7000);
      }; // checkToPreventGeolocationIsOff

      var _initFirstTimeLocation = false;
      var _watchId = 0;
      var _map = null;
      var _marker = null;
      var _circle = null;
      var _options = {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 2000 // ms
      };
      var _lat,_lng,_radius = null;


      function onError(error) {
        console.log("Error code: " + error.code);
        console.log("Error message: " + error.message);
        // error.code == 1 -> PERMISSION_DENIED (1) if the user clicks that “Don’t Share” button or otherwise denies you access to their location.
        // error.code == 2 -> POSITION_UNAVAILABLE (2) if the network is down or the positioning satellites can’t be contacted.
        // error.code == 3 -> TIMEOUT (3) if the network is up but it takes too long to calculate the user’s position.
      }; // onError

      return {
        // Public methods and variables
        start: function() {
          console.log("geolocation start");
          if (navigator.geolocation) {
            if (instance._watchId)
              navigator.geolocation.clearWatch(instance._watchId);
            instance._watchId = navigator.geolocation.watchPosition(onPosition, onError, instance._options);
            checkToPreventGeolocationIsOff();
          }
        },
        stop: function() {
          console.log("geolocation stop");
          if (navigator.geolocation)
            navigator.geolocation.clearWatch(instance._watchId);
          instance._watchId = 0;
          instance._initFirstTimeLocation = false;
          Session.set("locationFound", false);
        },
        doNotCenterOnFirstLocation: function() {
          instance._initFirstTimeLocation = true;
          Session.set("hasAlreadyFoundAPosition", true);
        },
        isRunning: function() {
          return instance._watchId != 0;
        },
        updateMapPosition:function(position){
          if (!instance._lat || !instance._lng)
            return;

          if (!position){
            position = {coords:{latitude:instance._lat,longitude:instance._lng}};
          }

          instance._circle.setRadius(instance._radius).addTo(instance._map);
          instance._marker.setLatLng({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          // bind one time click event and other stuff, the map must be loaded
          if (!instance._initFirstTimeLocation && instance._map) {
            instance._map.setView(instance._marker.getLatLng(), instance._map.getZoom());
            instance._initFirstTimeLocation = true;
            Session.set("hasAlreadyFoundAPosition", true);
          }

        },
        setComponents:function(map, marker, circle){
          instance._map = map;
          instance._marker = marker;
          instance._circle = circle;
        }
      }; // return

  }; // init()

    return {
      getInstance: function() {
        if (!instance) {
          instance = init();
        }
        
        return instance;
      } // getInstance
    };

  })();