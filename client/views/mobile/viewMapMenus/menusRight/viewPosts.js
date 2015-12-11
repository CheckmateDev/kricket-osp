/*
*   viewPosts.js
*   Content of each tag emoji/photo
*/

karmaPostRenderingView = null;
karmaStoreRenderingView = null;
viewPostsRenderingView = null;

var currentViewPostInstance = null;

/* Helpers */

Template.viewPosts.helpers({
	posts:function(){
		// get my posts or get my favorited posts
        if (Session.get("postType") == "my")
            return Atmos.find({
            createdUserId:Meteor.userId(),
            timeLimit: {$gte: new Date()}},{sort:{"comments.createdAt":-1}});

        if (Session.get("postType") == "followed")
            return Atmos.find({
                timeLimit: {$gte: new Date()},
                "lovedBy.userId":Meteor.userId()},{sort:{"comments.createdAt":-1}});
	},
    typeIs:function(typeAtmosphere){
        return this.typeAtmos==typeAtmosphere;
    },
    postType:function(tab){
        return (Session.get("postType") == tab);
    },
    count:function(objs){
        return objs.fetch().length;
    },
    read:function(){
        // return if it's read by me
        followers = this.readByFollower;
        if (typeof(followers)=="undefined")
            return true;
        else
            return followers.filter(function(value){ if (value.userId==Meteor.userId()){ return true;} return false;}).length==1;
    },
    img:function(){
        var self = this._id;
        Meteor.call("getPhoto",this._id,function(err,res){
            $("#photo-"+self).attr("src",res.photo);
        });
    },
    getCounter:function(){
        var val = ViewTagCounter.getInstance().counterHash.get(this._id);
        return val?val:"";
    }
});


/* Events */

Template.viewPosts.events({
	'click #btnMyTags': function(e) {
		e.preventDefault();
		Template.viewPosts.loadPosts("my");
	},
	'click #btnFollowedTags': function(e) {
		e.preventDefault();
		Template.viewPosts.loadPosts("followed");
	},
    'click .view-posts-row':function(e,t){
        // loading a tag
        var posts;
        if (Session.get("postType") == "my")
            posts = Atmos.find({createdUserId:Meteor.userId(),
            timeLimit: {$gte: new Date()}},{fields:{'_id':1},sort:{"comments.createdAt":-1}}).fetch();

        if (Session.get("postType") == "followed")
            posts = Atmos.find({timeLimit: {$gte: new Date()},
                "lovedBy.userId":Meteor.userId()},{fields:{'_id':1},sort:{"comments.createdAt":-1}}).fetch();
        Template.viewTagBig.tellIHaveReadComments(this._id);
        Template.viewPostsDetail.showPostViewDetail(this._id);
        Template.viewTagBig.showViewTag();
        ViewTagCounter.getInstance().stop();
    },
});

/* Methods */

Template.viewPosts.init = function(){
    var parent = document.getElementById("map-container");

    if (currentViewPostInstance && karmaPostRenderingView){
        ViewTagCounter.getInstance().stop();
        ViewTagCounter.getInstance().run(currentViewPostInstance.atmosIds);
    }else{
        if (!karmaPostRenderingView){
            karmaPostRenderingView = Blaze.render(Template.viewPosts, parent);
            $("#postViewDetail").removeClass('slideOutLeft').addClass('slideInLeft');
        }
    }
    Template.viewPosts.loadPosts("my");
}

Template.viewPosts.hidePostsViewDetail = function() {
	console.log("viewPosts::hidePostsViewDetail");
	setTimeout(function() {
		$('#postView').show();
	}, 500);
	$("#postView").removeClass('slideInLeft').addClass('slideOutLeft');
}

Template.viewPosts.created = function(){
    console.log("viewPosts::created");
    // We get all atmosphere ids that we created or loved
    currentViewPostInstance = this;
    Template.viewPosts.runCounters();
}

Template.viewPosts.runCounters = function(){
    if (!currentViewPostInstance)
        return;
    ViewTagCounter.getInstance().stop();

    atmosArray = Atmos.find({$or:[{
                        createdUserId:Meteor.userId(),
                        timeLimit: {$gte: new Date()}
                    },
                    {
                        "lovedBy.userId":Meteor.userId(),
                        timeLimit: {$gte: new Date()},
                    }
                    ]},
                    {fields:{_id:1}}
            ).fetch();
    atmosIds = [];
    for(var i=0;i<atmosArray.length;i++){
        atmosIds.push(atmosArray[i]._id);
    }
    // when launching via blaze render we have to pass myViewTagCounter otherwise no way to get it. (see renderwithdata call)
    currentViewPostInstance.atmosIds = atmosIds;
    ViewTagCounter.getInstance().run(atmosIds);
}

Template.viewPosts.destroyed = function(){
    console.log("viewPosts::destroyed");
    ViewTagCounter.getInstance().stop();
    karmaPostRenderingView = null;
}

Template.viewPosts.hideViewPosts = function() {
    console.log('closing viewPosts');
    $('#viewPosts').removeClass('slideInLeft').addClass('slideOutLeft').show();
    // we use myViewTagCounter visible from this kind of call
        setTimeout(function(){

      if (karmaPostRenderingView)
                Blaze.remove(karmaPostRenderingView);
    karmaPostRenderingView=null;
    }, 500);
}

Template.viewPosts.showMenuTags = function() {
    console.log('showing viewPosts');
    var parent = document.getElementById("map-container");
    if (viewPostsRenderingView) {
        $("#viewPosts").removeClass('slideOutLeft').addClass('slideInLeft');
    } else {
        viewPostsRenderingView = Blaze.render((Template.viewPosts), parent);
    }    $("#viewPosts").removeClass('slideOutLeft').addClass('slideInLeft');
};

Template.viewPosts.loadPosts = function(type){
        Session.set("postType",type);
}
