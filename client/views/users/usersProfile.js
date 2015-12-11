/*
*   usersProfile.js
*
*/
userProfileRenderingView = null;
var _backToProfile= false;

/* Events */

Template.usersProfile.events({
    'click #btnLogout': function(e, t){
        e.preventDefault();
        Template.map.hideKarmaView();
        if(karmaRenderingView) {
            Blaze.remove(karmaRenderingView);
            karmaRenderingView=null;
        }
        if(userProfileRenderingView){
            Blaze.remove(userProfileRenderingView);
            userProfileRenderingView = null;
        }
        if(tagRenderingView){
            Blaze.remove(tagRenderingView);
            tagRenderingView = null;
        }
        if (atmosRenderingView){
            Blaze.remove(atmosRenderingView);
            atmosRenderingView = null;
        }
        Session.set("karmaOn",false);
        myLocatePerson.stop();
        console.log("logout : "+ Session.get("karmaOn"));
        Meteor.logout();
    },'click #btnChangePwd':function(e,t){
        e.preventDefault(); 
        $(".change-password").removeClass("hide");
        $(".hide-when-change-pwd").hide();
        _backToProfile=true;
    },
    'click #btnChangePassword':function(e,t){
    	e.preventDefault();        
        Router.current().changePassword(t);
        backToProfile();
    },
    'click #btnSendEmojiReq':function(e,t){
        e.preventDefault();
        var req = $("#emojiRequest").val();
        if (req.trim().length!=0){
            Meteor.call("requestForNewEmoji",req);
            $("#lblEmojiSent").removeClass("hide");
            Meteor.setTimeout(function(){$("#lblEmojiSent").addClass("hide");},5000); // wait 5seconds then replace hide
            $("#emojiRequest").val(""); // reset
        }
    },
    'click #xProfile':function(e,t){
        e.preventDefault();
        if (!_backToProfile)
            Template.usersProfile.hideUserProfile();
        else
            backToProfile();
    },

    'click #btnTutorial': function(e){
        e.preventDefault();  
    },

    'click #btnFaqs': function(e){
        e.preventDefault();
        Template.usersFaqs.showFaqs();      
    },
});

/* Methods */

backToProfile=function(){
    $(".change-password").addClass("hide");
    $(".hide-when-change-pwd").show();
    _backToProfile=false;
}

Template.usersProfile.showUserProfile=function(){
   $(".change-password").addClass("hide");
   $(".hide-when-change-pwd").show();

}

Template.usersProfile.hideUserProfile = function(){
    console.log("hide usersProfile");
    $("#userProfileView").hide();
}

Template.usersProfile.showUserProfile = function(){
    console.log("show usersProfile");
    var parent = document.getElementById("map-container");
    if(userProfileRenderingView)
        $("#userProfileView").show();
    else
        userProfileRenderingView = Blaze.render((Template.usersProfile), parent);
}