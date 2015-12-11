/*
*	emojis.js
* 	Publication of emojis2 collection (emojis)
*/

var self = this;
Meteor.publish("emojis2", function() {
	var categories = new self.categories();
	var list = categories.listOfCategories();
    return Emojis2.find({
		category : {$in: list}
	},{sort: {order:1}});
});
