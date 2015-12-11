/*
*   viewTagBig.js
*   View of emoji/photo Tag 
*/

tagRenderingView = null;

/* Helpers */

Template.viewTagBig.helpers({
    currentMarker: function () {
        return Atmos.findOne(this.atmosId);
    },
    selectedEmoji:function(){
        return Session.get("emojiSelectedByKeyboard");
    },
    keyboardIsOn:function(){
        return Session.get("keyboardOn");
    },
    isCordova:function(){
        return Meteor.isCordova;
    },
    isOldVersion:function(){
        if (typeof(currentMarker)!="undefined"){
            if(currentMarker.length!=0){
                tempAtmos = Atmos.findOne(this._id);
                return (tempAtmos.category+".svg" == tempAtmos.icon);
            }
        }
    },
    prefix:function(){
        return spritesApp.prefix();
    },
    // helper to count the number of comments
    commentsCounter: function () {
        var zeroComments = "0";

        var atmos = Atmos.findOne(this._id).comments;
        if (!atmos || !atmos.length)
            return zeroComments;
        else
        //Removed the word comments and instead just display the comments cout
        //return (atmos.length==1?"1 comment":atmos.length+" comments");
            return (atmos.length);
    },
    typeIs:function(typeAtmosphere){
        return this.typeAtmos==typeAtmosphere;
    },
    img:function(){
        if (!Session.get("photoOfCurrentMarker-"+this._id)){
            Meteor.call("getPhoto",this._id,function(error,result){
                Session.set("photoOfCurrentMarker-"+result.atmosId,result.photo);
            });
        }
        return Session.get("photoOfCurrentMarker-"+this._id);
    },
    loved:function(){
        return Template.viewTagBig.isLoved(this._id);
    },
    timeCounter:function(){
        return ViewTagCounter.getInstance().counter.get();
    },
    // Helper to display lovedBy counter
    lovedByCounter: function () {
      var lovedByCount = Atmos.findOne({_id: this._id}).lovedBy;
      if (typeof(lovedByCount) == "undefined") {
        return lovedByCount = "0";
      } else {
        return lovedByCount.length;
      }

    },
    hasBeenOffensive:function(){
        return Session.get("offensiveContentAtmosphere-"+this._id)==true;
    },
    isTranslatedVibe:function(){
        if (!Meteor.user().profile.preferredLanguage || Meteor.user().profile.preferredLanguage=="none"){
            return false;
        }
        var self=this;
        Tracker.nonreactive(function(){
            Meteor.call("getTranslatedVibe",self._id,
                function(error,result){
                    Session.set("translatedVibe",result);
            });
        });
        return true;
        
    },
    translatedVibe:function(){
        return Session.get("translatedVibe");
    },
    areTranslatedComments:function(){
        if (!Meteor.user().profile.preferredLanguage || Meteor.user().profile.preferredLanguage=="none"){
            return false;
        }
        var self=this;
        Tracker.nonreactive(function(){
            Meteor.call("getTranslatedComments",self._id,
                function(error,result){
                    Session.set("translatedComments",result);
            });
        });
        return true;
    },
    translatedComments:function(){
        return Session.get("translatedComments");
    }
});

/* Events */

Template.viewTagBig.events({
    'click .button-animation':function(e){
    // manage all animations of viewtag buttons, on browser & mobile
        buttonAnimationWithHoverClass(e);
    },
    'click .btn-love':function(e,t){
        // toggle btn love
        var method = "";
        var atmosId = t.data.atmosId;
        if (Template.viewTagBig.isLoved(atmosId))
            method = "hateThisAtmos";
        else
            method = "loveThisAtmos";
        Meteor.call(method,atmosId,function(error,result){
            // must be ok then
            if (!error)
                Session.set("lovedByMe",(method=="loveThisAtmos"?true:false));
        });
    },
    'click #addComment':function(e,i){
        e.preventDefault();
        Template.map.showKeyboardMap();
        return false;
    },
    'click #tellTheWorld':function(e,t){
        e.preventDefault();
        setTimeout(function(){ return tellTheWorld(t.data.atmosId); }, 800);
    },
    'click .editComment':function(e){
        e.preventDefault();
        // to avoid returning to the map when clicking this zone
        return false;
    },
    'click .newComment':function(e){
        $(e.target).focus();
        Template.map.hideKeyboardMap(true);
        return true;
    },
    'keyup input.newComment': function (e, t) {
        if (e.which === 13) {
            return tellTheWorld(t.data.atmosId);
        }else{
            Session.set("newComment",e.currentTarget.value);
        }
    },
    'click .changeSelectedEmoji': function(e,t){
        e.preventDefault();
        Template.map.showKeyboardMap();
    },
    'click .tag-emoji':function(e,t){
        e.preventDefault();
        return false; // avoid map click event launch
    },
    'click .alertContent':function(e,t){

        swal({
          title: "Are you sure?",
          text: "Do you want to flag this atmosphere as inappropriate?",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#F96C58",
          confirmButtonText: "Yes",
          closeOnConfirm: false,
          html: false
        }, function(isConfirm) {
          if (isConfirm) {
            Meteor.call("alertForOffensiveContent",t.data.atmosId);
            Session.set("offensiveContentAtmosphere-"+t.data.atmosId,true);
            swal("Flagged!", "Admin notified.", "success");
          } else {
            swal("Cancelled", "Your imaginary file is safe :)", "error");
          }
        });

    }
});

/* Methods */

Template.viewTagBig.tellIHaveReadComments=function(atmosId){
    // We call server to say that we opened this atmos (just if we love this atmos).
    var atmos = Atmos.findOne({_id:atmosId,"lovedBy.userId":Meteor.userId()});
    if (typeof(atmos)!=undefined)
        Meteor.call("tagOpenedBy",atmosId);
}

tellTheWorld = function(atmosId){
    if (Session.get("newComment").trim().length==0)
        return false;
    var commentToSend = Session.get("newComment").trim();
    // erase it now !
    $("input.newComment").val("");
    Session.set("newComment","");

    // send the message linked to marker
    Meteor.call("addComment",atmosId,commentToSend,Session.get("emojiSelectedByKeyboard"),function(){
        Template.map.hideKeyboardMap(); // in case it is still open
        mixpanel.track("User leave a comment");
    });
    return false;
}

Template.viewTagBig.resetViewTag=function(resetSelectedMarker){
    if (resetSelectedMarker)
        Meteor.setTimeout(function(){ Session.set("selectedMarker","");},0.75);
    ViewTagCounter.getInstance().stop();
    $("input.newComment").val("");
    Session.set("newComment","");
    Session.set("photoOfCurrentMarker","");
    Session.set("timeCounter","");
    Template.map.hideKeyboardMap();
}

Template.viewTagBig.showViewTag = function(){
    $(".viewTagBig").removeClass("hide");
}

Template.viewTagBig.created = function () {
    this.atmosId = new ReactiveVar();
    this.fromMap = this.data.fromMap;
    if (this.data && this.data.atmosId){
        this.atmosId.set(this.data.atmosId);
        // enable local counter
        ViewTagCounter.getInstance().run(this.data.atmosId,function(){Template.map.removeTagView()});
    }
};

Template.viewTagBig.destroyed = function () {
    ViewTagCounter.getInstance().stop();
};

getPhotoData = function(atmosId,callback) {
    Meteor.call("getPhoto",atmosId,function(error,result){
        callback(null,result);
    });
};

Template.viewTagBig.isLoved=function(atmosId){
        var loved = Atmos.findOne({_id:atmosId,"lovedBy.userId":Meteor.userId()});
        if (typeof(loved)=="undefined")
            return false;
        return true;
}
