/*
*	atmos.js
* 	Publication of atmospheres (tags placed on the map)
*/

Meteor.publish('atmos', function(doc, sort) {
	//return placed markers, expires after timeLimit now 
	var min = new Date();
	var user = Meteor.users.findOne({_id:this.userId})

	if (user && user.profile && user.profile.role=="admin"){
		return Atmos.find({
			timeLimit: {$gte: min},
			createdUserId : this.userId},
			{ 
				fields: { 
					createdUserName:0,
					"comments.createdUserId":0,
					hadBeenLovedBy:0,
					vibeTranslations:0,
					"comments.translations":0
				} 
			}
		);
	}else{
		return Atmos.find({
			timeLimit: {$gte: min}},
			{ 
				fields: { 
					createdUserName:0,
					"comments.createdUserId":0,
					hadBeenLovedBy:0,
					vibeTranslations:0,
					"comments.translations":0
				} 
			}

		);		
	}
});