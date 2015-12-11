/*
*   mobile.js
*   Server side methods about atmos
*/

Meteor.methods({
    tagOpenedBy:function(atmosId){
        Atmos.update({_id:atmosId},{$addToSet:{
            readByFollower:{
                userId:this.userId
            }
        }});
    },
    shareMessage : function(atmosId){
        // when we will have time, it must launch generating image and store it into db
        return '/messages/'+atmosId+".png";
    },
    sharedMessage:function(atmosId){
        // message shared by user
        var atm = Atmos.findOne({_id:atmosId});
        if (atm){
            // update timeLimit for each share
            var timeLimit = new Date(atm.timeLimit);
            timeLimit.addMinutes(30);
            Atmos.update({_id:atmosId},{$set:{timeLimit:timeLimit},$inc:{shareCount:1}});

            creator = Meteor.users.findOne({_id:atm.createdUserId});
            if (creator && creator.notificationOnShare){
                var not = new pushNotification();
                var title = "New share!";
                var text = "Someone shared your Tag!";
                not.sendMessageTo(creator._id,title,text);
                WebAppNotification.insert({title:title,text:text,forUserId:creator._id,atmosId:atmosId}); // send web app notification
                console.log("sharedMessage Notification !");
            }else{
                console.log("sharedMessage no Notification !");
            }
        }

    },
    getAvailableCategories : function(){
        // Returns category names that we allow client to see
        // could be automated via admin in further time
        var cat = new categories();
        return cat.getCategories();
    },
    isLovedByYou:function(atmosId){
        var loved = Atmos.findOne({_id:atmosId,"lovedBy.userId":this.userId});
        if (typeof(loved)=="undefined")
            return false;

        return true;
    },
    loveThisAtmos:function(atmosId){
        console.log("love asked for atmos : "+atmosId);
        var loved = Atmos.findOne({_id:atmosId,"lovedBy.userId":this.userId});
        if (typeof(loved)=="undefined")
        {
            var atmos = Atmos.findOne({_id:atmosId});
            var limit = new Date(atmos.timeLimit);


            var hadBeenLovedBy = Atmos.findOne({_id:atmosId,"hadBeenLovedBy.userId":this.userId});
            var cmd = {};


            cmd.$push={
                lovedBy:{
                    userId:this.userId
                }
            };

            // only for not owners and 1 time by user
            if (typeof(hadBeenLovedBy)=="undefined"){
                cmd.$push.hadBeenLovedBy={userId:this.userId};

                // add 10 minutes to time limit,
                if (Meteor.userId()!=atmos.createdUserId){
                    limit.addMinutes(10);
                    cmd.$set={
                        timeLimit:limit
                    };
                }
            }

            console.log("cmd : "+ JSON.stringify(cmd));
            Atmos.update({_id:atmosId},cmd,function(err){

                if(!err){
                    creator = Meteor.users.findOne({_id:atmos.createdUserId});
                    // We can love this atmosphere (or follow) and not get notifications on our follow
                    if (creator && creator.notificationOnFollow && Meteor.userId()!=atmos.createdUserId){
                        var not = new pushNotification();
                        var title = "New follow!";
                        var text = "Someone is following your Tag!";
                        not.sendMessageTo(creator._id,title,text);
                        WebAppNotification.insert({title:title,text:text,forUserId:creator._id,atmosId:atmosId}); // send web app notification
                        console.log("Follow Notification !");
                    }
                }
                else
                   console.log("loveThisAtmos error : "+err.message);
           });


        }
    },
    hateThisAtmos:function(atmosId){
        var loved = Atmos.findOne({_id:atmosId});
        if (typeof(loved)=="undefined" || typeof(loved.lovedBy)=="undefined")
            return;
        var self = this;
        var arrayWithoutYou = loved.lovedBy.filter(function(item){
            return item.userId==self.userId?null:item;
        })
        Atmos.update({_id:atmosId},{
            $set:{
                lovedBy:arrayWithoutYou
            }
        });
    },
    'insertPhotoAtmos':function(latlng,photo,vibe,orientation){


        if (typeof(vibe)=="undefined")
            vibe = "";

        if (typeof(orientation)=="undefined")
            orientation = 0;

        // Check that we don't abuse insert method...
        try{
            if (WatchIp.isBanned(this.connection,this.userId)){
                // send some love !
                return "Hey, you are banned, try to not consume all resources";
            }

        }catch(ex){
            console.log("Error : "+ex.message);
        }

        var self=this;
        if (latlng==null)
            return "error";

        if (photo.length>1500000){
            mixpanel.track("User post Atmos photo too big",{distinct_id:Meteor.user().username});
            console.log("User post Atmos photo too big");
            return "photo too big";
        }

        console.log("insert photo");


        var ig = new imageGeneration(photo,orientation);
        Photos.insert({photo : photo,extension:ig.getExt()}, function (err, obj) {

            if (err) console.log("Error insertPhotoAtmos : "+err);

            ig.getPhotoResized(300,null,Meteor.bindEnvironment(function(bitmap){
                Photos.update({_id:obj},{$set:{photo : bitmap}});
            }));

            console.log("photo id : "+obj);

            self.atmosId = Atmos.insert({
                typeAtmos : "photo",
                latlng : latlng,
                createdUserId: this.userId,
                photo : obj,
                vibe : vibe,
                createdUserName: (Meteor.user().profile ? (Meteor.user().profile.name ? Meteor.user().profile.name:"no name"):"no name"),
                readByFollower: [{"userId": Meteor.userId()}]
            }, function (error, obj) {
                if (error)
                    console.log("error : "+ error.message);
                else{
                    // calculate async the thumbnail
                    ig.getThumbnail(Meteor.bindEnvironment(function(bitmap){
                        console.log("getThumbnail callback");
                        Atmos.update({_id:obj},{$set:{thumbnail : bitmap}});

                    }));
                }
            });
            /* Add 1 karma for each new atmosphere*/
            Meteor.users.update({_id:Meteor.userId()},{$inc: {karma: 5}});

            mixpanel.track("User post Atmos photo",{distinct_id:Meteor.user().username,"atmosId":self.atmosId});
            mixpanel.people.increment(Meteor.user().username, "karma");

            return "success";
        });
},
getPhoto:function(atmosId){
    console.log("get photo of atmosId : "+atmosId);
    var photoId = Atmos.findOne({_id:atmosId}).photo;
    return {
        "atmosId":atmosId,
        "photo":Photos.findOne({_id:photoId}).photo
    };
},
'insertAtmos':function(latlng, icon, category, vibe){

        // Check that we don't abuse insert method...
        try{
            if (WatchIp.isBanned(this.connection,this.userId)){
                // send some love !
                return "Hey, you are banned, try to not consume all resources";
            }

        }catch(ex){
            console.log("Error : "+ex.message);
        }
        // New api post 1st of july 2015.
        if (latlng==null)
            return "error";

        console.log("insert Atmos");
        atmosId = Atmos.insert({
            latlng : latlng,
            createdUserId: this.userId,
            icon: icon,
            category: category,
            vibe: vibe,
            createdUserName: (Meteor.user().profile ? (Meteor.user().profile.name ? Meteor.user().profile.name:"no name"):"no name"),
            readByFollower: [{"userId": Meteor.userId()}]
        }, function (error, result) {
            if (error)
                console.log("error during insertAtmos : "+ error.message);
        });
        /* Add 1 karma for each new atmosphere*/
        Meteor.users.update({_id:Meteor.userId()},{$inc: {karma: 5}});

        mixpanel.track("User post Atmos message",{distinct_id:Meteor.user().username,"atmosId":atmosId,"icon":icon,"category":category});
        mixpanel.people.increment(Meteor.user().username, "karma");

        return "success";
    },
    'insertKarmaStoreAtmos':function (latlng, emojiId, emojiPackId, vibe) {
                // Check that we don't abuse insert method...
                try{
                    if (WatchIp.isBanned(this.connection,this.userId)){
                // send some love !
                return "Hey, you are banned, try to not consume all resources";
            }

        }catch(ex){
            console.log("Error : "+ex.message);
        }
        
        console.log("insert KarmaStoreAtmos");
        // check that user can have this emoji (will depends on publish method server side)
        // we just have to check that (emojiId, emojiPackId) is existing !
        var pack = Pack.find({_id:emojiPackId}).fetch()
        if (!pack || !pack.length){
            console.log("insertKarmaStoreAtmos : pack is not identified")
            return;
        }
        //console.log("Array : " + JSON.stringify(pack[0].emojis));
        var emojiArray = pack[0].emojis.filter(function(obj){if (obj._id==emojiId) return true;})
        if (!emojiArray.length){
            console.log("insertKarmaStoreAtmos : array is empty");
            return;
        }

        var ig = new imageGeneration(emojiArray[0].emoji);

        Atmos.insert({
            typeAtmos : "karmaStoreEmoji",
            latlng : latlng,
            createdUserId: this.userId,
            karmaStoreEmoji : emojiArray[0].emoji,
            vibe : vibe,
            createdUserName: (Meteor.user().profile ? (Meteor.user().profile.name ? Meteor.user().profile.name:"no name"):"no name"),
            readByFollower: [{"userId": Meteor.userId()}]
        }, function (error, obj) {
            if (error)
                console.log("error : "+ error.message);
            else{
                    // calculate async the thumbnail
                    ig.getThumbnail(Meteor.bindEnvironment(function(bitmap){
                        console.log("getThumbnail callback");
                        Atmos.update({_id:obj},{$set:{thumbnail : bitmap}});
                        Meteor.users.update({_id:Meteor.userId()},{$inc: {karma: 5}});
                    }));
                }
            });
    },
    addComment:function(atmosId,comment,icon){
        Atmos.update(
            atmosId,
            {
                $push:{
                    comments:{
                        "comment":comment,
                        "icon":icon
                    }
                },
                $set:{
                    readByFollower:
                    [{userId:Meteor.userId()}]

                }
            }
            );

        /* add 1 karma for user posting comment */
        Meteor.users.update({_id:Meteor.userId()},{$inc: {karma: 1}});
        /* add 1 karma for user creator if creator != current user */
        var atm = Atmos.findOne({_id:atmosId});
        if (Meteor.userId()!=atm.createdUserId){
            Meteor.users.update({_id:atm.createdUserId},{$inc: {karma: 1}});

            // update timeLimit only if commented by someone else, and not the owner
            var timeLimit = new Date(atm.timeLimit);

            timeLimit.addMinutes(20);
            console.log("timeLimit : "+timeLimit);
            Atmos.update({_id:atmosId},{$set:{timeLimit:timeLimit}})

            creator = Meteor.users.findOne({_id:atm.createdUserId});
            if (creator){
                console.log("username +1 karma : "+ creator.username);
                mixpanel.people.increment(creator.username, "karma");
                //
                // push notification to creator !
                var not = new pushNotification();
                var title = "New comment!";
                var text = "You have a new comment on your Tag!";
                not.sendMessageTo(creator._id,title,text);
                WebAppNotification.insert({title:title,text:text,forUserId:creator._id,atmosId:atmosId}); // send web app notification
            }else{
                console.log("just try to add +1 karma to user :" + atm.createdUserId + " but he doesn't exist anymore");
            }

        }
        mixpanel.track("User leave a comment",{distinct_id:Meteor.user().username,"atmosId":atmosId});
        mixpanel.people.increment(Meteor.user().username, "karma");

        return 0;
    },
    'upvote' : function (selectedMarker) {
        //see if upvoted\downvoted already TODO refactor
        currentUserId = Meteor.userId();

        atmos = Atmos.findOne(selectedMarker);
        creator = Meteor.users.findOne({_id:atmos.createdUserId});
        if (creator && creator.notificationOnFollow){
            var not = new pushNotification();
            var title = "New Vote!";
            var text = "Someone is voting for your Tag!";
            not.sendMessageTo(creator._id,title,text);
            WebAppNotification.insert({title:title,text:text,forUserId:creator._id,atmosId:selectedMarker}); // send web app notification
            console.log("Vote Notification !");
        }

        function upflag() {
            if (Atmos.find({
                $and: [
                { _id: selectedMarker},
                { upvotedBy: { $in: [currentUserId] } }
                ]
            }).count() > 0) {

                return true;
            } else {
                return false;
            }
        }
        function downflag() {
            if (Atmos.find({
                $and: [
                { _id: selectedMarker},
                { downvotedBy: { $in: [currentUserId] } }
                ]
            }).count() > 0) {
                return true;
            } else {
                return false;
            }
        }
        //update vote counts
        if (downflag()) {
            Atmos.update(selectedMarker, {$inc: {upvotes: 1}});
            Atmos.update(selectedMarker, {$inc: {downvotes: -1}});
            Atmos.update(
                { _id: selectedMarker},
                { $push: { upvotedBy: currentUserId}}
                );
            Atmos.update(
                { _id: selectedMarker},
                { $pull: { downvotedBy: currentUserId}}
                );
        } else if (upflag()) {
            Atmos.update(selectedMarker, {$inc: {upvotes: -1}});
            Atmos.update(
                { _id: selectedMarker},
                { $pull: { upvotedBy: currentUserId}}
                )
        } else {
           Atmos.update(selectedMarker, {$inc: {upvotes: 1}});
           Atmos.update(
            { _id: selectedMarker},
            { $push: { upvotedBy: currentUserId}}
            );
       }


   },
   'downvote' : function (selectedMarker) {
        //see if upvoted\downvoted already TODO refactor
        currentUserId = Meteor.userId();
        function upflag() {
            if (Atmos.find({
                $and: [
                { _id: selectedMarker},
                { upvotedBy: { $in: [currentUserId] } }
                ]
            }).count() > 0) {
                return true;
            } else {
                return false;
            }
        }
        function downflag() {
            if (Atmos.find({
                $and: [
                { _id: selectedMarker},
                { downvotedBy: { $in: [currentUserId] } }
                ]
            }).count() > 0) {
                return true;
            } else {
                return false;
            }
        }
        //update vote counts
        if (upflag()) {
            Atmos.update(selectedMarker, {$inc: {downvotes: 1}});
            Atmos.update(selectedMarker, {$inc: {upvotes: -1}});
            Atmos.update(
                { _id: selectedMarker},
                { $push: { downvotedBy: currentUserId}}
                );
            Atmos.update(
                { _id: selectedMarker},
                { $pull: { upvotedBy: currentUserId}}
                );
        } else if (downflag()) {
            Atmos.update(selectedMarker, {$inc: {downvotes: -1}});
            Atmos.update(
                { _id: selectedMarker},
                { $pull: { downvotedBy: currentUserId}}
                )
        } else {
           Atmos.update(selectedMarker, {$inc: {downvotes: 1}});
           Atmos.update(
            { _id: selectedMarker},
            { $push: { downvotedBy: currentUserId}}
            );
       }
   },

   'notificationRead' : function(docId){
    WebAppNotification.remove({_id:docId,forUserId:Meteor.userId()});
},
'getTranslatedVibe':function(atmosId){
    check(atmosId,String);
    lang = Meteor.user().profile.preferredLanguage;
    atmos = Atmos.findOne({_id:atmosId,"vibeTranslations.lang":lang});
    if (atmos){
        for(i=0;i<atmos.vibeTranslations.length;i++){
            if (atmos.vibeTranslations[i].lang==lang){
                return atmos.vibeTranslations[i].text;
                break;
            }
        }
    }else{
        atmos = Atmos.findOne({_id:atmosId});
        var translated = translate(atmos.vibe,lang);

        Atmos.update({_id:atmosId},{
            $push:{
                vibeTranslations:{
                    lang:lang,
                    text:translated
                }
            }
        });
        return translated;
    }
},
'getTranslatedComments':function(atmosId){
    check(atmosId,String);

    lang = Meteor.user().profile.preferredLanguage;
    atmos = Atmos.findOne({_id:atmosId});

        // Check for each comment that there is translation available
        var translatedComments = [];
        if (atmos && atmos.comments){
            atmos.comments.forEach(function(element,index){
                    // not translation for this comment
                    if (!element.translations || !atmosCommentHasTranslationForThisLanguage(element,lang)){
                        var translated = translate(element.comment,lang);

                        // if translation worked (frengly has a 3s minimum time between api call)
                        if (translated){
                            var cmd = {};
                            cmd.$push = {};
                            cmd.$push["comments."+index+".translations"] = {
                                lang:lang,
                                text:translated
                            };
                            Atmos.update({_id:atmosId},cmd);
                            translatedComments.push(translated);
                        }else{
                            translatedComments.push(element.text);
                        }
                    }else{
                        for(i=0;element.translations.length;i++){
                            if (element.translations[i].lang==lang){
                                translatedComments.push(element.translations[i].text);
                                break;
                            }
                        }
                    }
                });
}
return translatedComments;
},
});
