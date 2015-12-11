/*
*   Atmos.js
*   Definition of atmos collection (tags on map) with schema
*/

SimpleSchema.debug = true

Atmos = new Mongo.Collection("atmos");

var atmoSchema = new SimpleSchema({
    lovedBy:{
        type : [Object],
        label : "Loved by",
        optional:true
    },
    "lovedBy.$.userId":{
        type : String,
        label : "Loved by userId",
        optional:true
    },
    readByFollower:{
        type : [Object],
        label : "Read by",
        optional:true
    },
    "readByFollower.$.userId":{
        type : String,
        label : "Read by userId",
        optional:true
    },
    hadBeenLovedBy:{
        type : [Object],
        label : "Had been loved by",
        optional:true
    },
    "hadBeenLovedBy.$.userId":{
        type : String,
        label : "Loved by userId",
        optional:true
    },
    thumbnail:{
        type: String,
        label: "Thumbnail photo",
        optional:true
    },
    properties:{
        type: Object,
        label :"Properties",
        optional: true
    },
    "properties.id":{
        type: String,
        label :"id of object imported"
    },
    "properties.umap_social_facility":{
        type: String,
        label :"umap social facility",
        optional:true
    },
    "properties.umap_property":{
        type: String,
        label :"umap property",
        optional:true
    },
    "properties.type":{
        type: String,
        label :"type",
        optional:true
    },
    comments:{
        type: [Object],
        label: "Comments",
        optional:true,
        autoform: {
            afFormGroup: {
              label: false
            }
        },
    },
    "comments.$.comment":{
        type:String,
        label:"Comment",
        optional:true
    },
    "comments.$.icon":{
        type:String,
        label:"Icon",
        optional:true        
    },
    "comments.$.createdAt":{
        type:Date,
        label:"comment date",
        autoValue:function(){
            if (this.operator === '$pull') return;

            if (!this.value)
                return new Date();
            else
                return this.value;
        }
    },
    "comments.$.createdUserId":{
        type:String,
        label:"comment user id",
        autoValue:function(){
            if (this.operator === '$pull') return;

            if (!this.isSet)
                return this.userId;
        }
    },
    "comments.$.readByCreator":{
        type:'boolean',
        label:"if creator read this comment",
        autoValue:function(){
            if (this.operator === '$pull') return;

            if (!this.isSet)
                return false;
        }
    },
    "comments.$.translations":{
        type:[Object],
        label:"Comment translations",
        optional:true
    },
    "comments.$.translations.$.lang":{
        type:String,
        optional:true
    },
    "comments.$.translations.$.text":{
        type:String,
        optional:true
    },
    time: {
        type: Date,
        label: "Created Date",
        autoValue:function(){
            if (this.operator === '$pull') return this.value;
            if (this.userId==null) return new Date();
            if (Meteor.user() && Meteor.user().profile && (Meteor.user().profile.role=="admin") && (typeof(this.value)!="undefined"))
                return this.value;
            if (!this.value)
                return new Date();
            else
                return this.value;
        },
        autoform: {
            afFormGroup: {
              label: false
            },
            afFieldInput: {
                type: "datetime-local"
            }
        }
    },
    timeLimit:{
        type:Date,
        label: "Time limit during visible state",
        autoValue:function(){
            if (this.operator === '$pull') return this.value;

            if (this.userId==null) return this.value;

            if (Meteor.user() && Meteor.user().profile && (Meteor.user().profile.role=="admin") && (typeof(this.value)!="undefined"))
                return this.value;
            if (this.isInsert){
                var d = new Date(this.field("time").value);
                d.setDate(d.getDate()+1);
                return d;
            }
        },
        autoform: {
            afFormGroup: {
              label: false
            },
            afFieldInput: {
                type: "datetime-local"
            }
        }
    },
    photo:{
        type: String,
        label:"Photo",
        optional: true
    },
    typeAtmos:{
        type:String,
        label:"Type of atmosphere",
        defaultValue: "emoji"
    },
    latlng: {
        type: Object,
        label: "Location",
        optional: true
    },
    "latlng.lat": {
    	type: Number,
    	label: "Latitude",
    	decimal: true,
    	optional: true
    },
    "latlng.lng": {
    	type: Number,
    	label: "Longitude",
    	decimal: true,
    	optional: true
    },
    category: {
    	type: String,
    	label: "Category",
        optional: function(){
            if (this.typeAtmos=="" || this.typeAtmos=="emoji")
                return false;
            return true;
        }
    },
    vibe: {
        type: String,
        label: "vibe",
        optional: true,
        autoform: {
            afFormGroup: {
              label: false
            },
        afFieldInput: {
            type: "textarea"
            }
        },
    },
    createdUserName: {
        type: String,
        label: "Created by name",
        optional: true
    },
    icon: {
    	type: String,
    	label: "icon",
        optional: function(){
            if (this.typeAtmos=="" || this.typeAtmos=="emoji")
                return false;
            return true;
        }
    },
    upvotes: {
    	type: Number,
    	autoValue: function () {
            if (this.operator === '$pull') return;

    		if (this.isInsert)
    			return 1;
    	}
    },
    upvotedBy: {
    	type: [String],
    	optional: true,
    	label: 'Upvoted by'
    },
    downvotedBy: {
    	type: [String],
    	optional: true,
    	label: 'Downvoted by'
    },    
    downvotes: {
    	type: Number,
    	autoValue: function () {
            if (this.operator === '$pull') return;

    		if (this.isInsert)
    			return 0;
    	}
    },
    createdUserId: {
        type: String,
        label: "Created by",
        autoValue: function() {
            if (this.operator === '$pull') return;
            if (this.isUpdate) return; // can't update

            if (this.userId == null) return "0";
            if (this.isInsert)
                return Meteor.user()._id;
            else
                return this.value;
        },
        denyUpdate: true,
        optional: true
    },
    karmaStoreEmoji:{
        type: String,
        label: "Karma store emoji",
        optional: true
    },
    shareCount:{
        type: Number,
        autoValue: function () {
            if (this.operator === '$pull') return;
            
            if (this.isInsert)
                return 1;
        }
    },
    vibeTranslations:{
        type:[Object],
        optional:true
    },
    "vibeTranslations.$.lang":{
        type:String,
        optional:true
    },
    "vibeTranslations.$.text":{
        type:String,
        optional:true
    }

});

Atmos.attachSchema(atmoSchema);