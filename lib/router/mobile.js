/*
*	mobile.js
* 	Routes
*/

Meteor.startup(function () {

	if (Meteor.isClient){
		Session.set("mapLoaded",false);
		Session.set("locationFound",false);
	}
	Router.route('/', {
		name: 'map',
		waitOn:function(){
			return [
				Meteor.subscribe("emojis2",function(){
					console.log("emojis2 subscribe callback event");
					Meteor.call("getAvailableCategories", function(error, result) {
				      if (error) {
				        console.log(error.reason);
				      } else {
				        categoriesAvailable = result;
				        // add reference to sprite stylesheets now

				        spritesApp.importSprites(categoriesAvailable);
				        spritesApp.calculateCategoriesOffset(categoriesAvailable);
				      }
				    });
				    // Calculate Emojis
				    Template.viewAtmospheresEmojis.calculateEmojis();
				}),
				{
					ready:function(){
						// launch location 
						if (!Session.get("locationFound")){
							var myLocatePerson = LocatePerson.getInstance();
	    					myLocatePerson.start();
							console.log("location not found");
							// just wait that location is found
						}
						return Session.get("locationFound")==true;
					}
				},
				{
					ready:function(){
						// and map is loaded
						if (!Session.get("mapLoaded")){
							console.log("map not loaded");
							Mapbox.load({
								plugins: ['markercluster']
							});
							Tracker.autorun(function(c) {
								Mapbox.debug = true;
								if (!Mapbox.loaded())
								  return;
								// just retrieve instance to init 
								var kmap = KricketMap.getInstance();
								c.stop();
							});
						}
						return Session.get("mapLoaded")==true;
					}
				}
			]
		},
		onAfterAction:function(){
		}
	});
	Router.route('/alert/:showAtmosId', function(){
		this.render('map');
	});
	Router.route('/mobile', {
		name: 'mobileIndex'
	});
	Router.route('/index', {
		name: 'sitesIndex'
	});
	Router.route('/share', {
		name: 'share'
	});
	Router.route('/emojisSlider',{
		name:'emojisSlider'
	});
});