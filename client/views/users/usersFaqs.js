/*
*   usersFaqs.js
*/

usersFaqsRenderingView = null;

/* Events */

Template.usersFaqs.events({
	'click #btnRead':function(e){
        e.preventDefault();
		// load map
		Template.usersFaqs.hideFaqs();

	}
});

/* Methods */

Template.usersFaqs.hideFaqs = function(){
    console.log("hide usersFaqsView");
    $("#usersFaqsView").hide();
}

Template.usersFaqs.showFaqs = function(){
    console.log("show usersFaqsView");
    var parent = document.getElementById("map-container");
    if(usersFaqsRenderingView)
        $("#usersFaqsView").show();
    else
        usersFaqsRenderingView = Blaze.render((Template.usersFaqs), parent);
}