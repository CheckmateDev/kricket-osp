/*
*	sprites.js
*	Used to insert links to sprites containing emojis
*/

sprites = function(){
	this.tinyScreen = function(){
		return window.innerWidth < 515;
	}

	this.importSprites = function(categoriesAvailable){
        var ticks = (new Date()).getTime();
		for(var i=0;i<categoriesAvailable.length;i++){
			if (categoriesAvailable[i].avoidCssLoad)
				continue;
		    var url = Meteor.absoluteUrl("png/sprites/"+categoriesAvailable[i].category + "/sprite.css?v="+ticks, {});
		    console.log("getting css sprites from this url : "+url);
		    $('head').append("<link rel='stylesheet' href='"+url+"' type='text/css' data-type='sprites' />");   
		}
	}

	this.calculateCategoriesOffset=function(categoriesAvailable){
	var size=0;
	var countEmojis = 0;
	for (var i=0;i<categoriesAvailable.length;i++){
		categoriesAvailable[i].offset = size;
		cat = categoriesAvailable[i].category;
		var count = Emojis2.find({category:cat}).count();
		countEmojis+=count;
		size=(Math.floor(countEmojis/4)) * 50;
	}

}

	this.prefix = function(){
		return "png";
	}
}
// Globally to avoid window screen changements
spritesApp = new sprites();