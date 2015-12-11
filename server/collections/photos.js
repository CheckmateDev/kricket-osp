/*
*   photos.js
*   Photos collection
*   Used to store photos taken on tags
*/

SimpleSchema.debug = true

Photos = new Mongo.Collection("photos");

var photosSchema = new SimpleSchema({
    photo:{
        type: String,
        label: "Photo"
    },
    extension:{
        type: String,
        label: "Extension"
    },
    createdUserId: {
        type: String,
        label: "Created by",
        autoValue: function() {
            if (this.isInsert)
                return Meteor.user()._id;
        },
        denyUpdate: true,
        optional: true
    },
    time: {
        type: Date,
        label: "Created Date",
        autoValue: function() {
            if (this.isInsert)
                return new Date;
        },
        denyUpdate: true
    }
});

Photos.attachSchema(photosSchema);