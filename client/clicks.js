/*
*	clicks.js
*	Clicks class to enable/disable clicks in app
* 	It just create an invisible layer above all
*/

clicks = function(){

	if (!$("#clicks-layer").length){
		$("body").append("<div id='clicks-layer' style='width:100%;height:100%;background-color:transparent;z-index:-1;position:absolute;top:0'></div>");
	}

	return {
		//
		enable : function(delay){
			if (!delay)
				delay=0;
			Meteor.setTimeout(function(){
				console.log("clicks enabled");
				$("#clicks-layer").css("z-index","-1").hide();			
			},delay);
		},
		// we disable all clicks
		disable : function(delay){
			if (!delay)
				delay=0;
			Meteor.setTimeout(function(){
				console.log("clicks disabled");
				$("#clicks-layer").css("z-index","100000").show();			
			},delay);
		}
	}
}