/*
*   emojisUpdated.js
*   EmojisUpdated collection
*   Used to store new packs of emojis and tell the server to generate them
*/

SimpleSchema.debug = true

EmojisUpdated = new Mongo.Collection("emojisUpdated");

var EmojisUpdatedSchema = new SimpleSchema({
    versionOfEmojis:{
        type: String,
        label: "versionOfEmojis"
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

EmojisUpdated.attachSchema(EmojisUpdatedSchema);