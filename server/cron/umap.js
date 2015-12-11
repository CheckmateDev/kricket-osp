/*
*   umap.js
*   Import of umap datas (deactivated for now) to import datas
*/

var propertyEmojis =[{
  umap : ["food_distribution","mobile kitchen"],
  kricket : "05_food",
  description : "Food distribution"
},{
  umap : ["medical_aid","medical assistance","medical care"],
  kricket : "03_medicine",
  description : "Medical aid"
},{
  umap : ["water_distribution"],
  kricket : "04_water",
  description : "Water distribution"
},{
  umap : ["childcare"],
  kricket : "13_baby",
  description : "Childcare"
},{
  umap : ["relief work"],
  kricket : "10_question",
  description : "Relief work"
},{
  umap : ["transit_zone"],
  kricket : "10_question",
  description : "Transit zone"
},{
  umap : ["asylum centre"],
  kricket : "10_question",
  description : "Asylum centre"
},{
  umap : ["reception centre"],
  kricket : "10_question",
  description : "Reception centre"
},{
  umap : ["transit_centre"],
  kricket : "10_question",
  description : "Transit centre"
},{
  umap : ["registration_centre"],
  kricket : "10_question",
  description : "Registration centre"
},{
  umap : ["reception_centre"],
  kricket : "10_question",
  description : "Reception centre"
},{
  umap : ["accomodation_centre"],
  kricket : "10_question",
  description : "Accomodation centre"
},{
  umap : ["migrant_detention_centre"],
  kricket : "10_question",
  description : "Migrant detention centre"
},{
  umap : ["convoys"],
  kricket : "10_question",
  description : "Convoys"
},{
  umap : ["fundraising"],
  kricket : "10_question",
  description : "Fundraising"
},{
  umap : ["collections"],
  kricket : "10_question",
  description : "Collections"
},{
  umap : ["warehouse"],
  kricket : "10_question",
  description : "Warehouse"
},{
  umap : ["office"],
  kricket : "10_question",
  description : "Office"
},{
  umap : ["camp coordinator"],
  kricket : "10_question",
  description : "Camp coordinator"
},{
  umap : ["interpreters"],
  kricket : "10_question",
  description : "Interpreters"
},{
  umap : ["non-food_items"],
  kricket : "10_question",
  description : "Non food items"
},{
  umap : ["EVI_assistance"],
  kricket : "10_question",
  description : "Extremely vulnerable individuals assistance"
},{
  umap : ["winterised"],
  kricket : "10_question",
  description : "Winterised"
},
{
  umap : ["building"],
  kricket : "10_question",
  description : "Building"
},
{
  umap : ["temporary"],
  kricket : "10_question",
  description : "Temporary"
},
{
  umap : ["constant_flow"],
  kricket : "10_question",
  description : "Constant flow"
}
];

function uToStr(value){
  return typeof(value)=="undefined"?"":""+value;
}


function sanitizeDataProperties(feature){

  var twitter = uToStr(feature.properties["twitter"]);
  if (twitter){
    // case 1 : malformed twitter url (multiple urls)
    if (twitter.split("https://").length>2)
      feature.properties["twitter"] = "https://"+twitter.split("https://")[1];

    // case 2 : just @ account
    if (twitter.indexOf("@")!=-1){
      feature.properties["twitter"] = "https://twitter.com/" + twitter.substr(twitter.indexOf("@")+1,twitter.length-twitter.indexOf("@")-1);
    }
  }

  return feature;
}


function getVibe(feature){
// For now, content is included in vibe, next version we will have to store each field in atmos
  var prop = feature.properties;
  var name = uToStr(prop["contact:name"]);
  var email = uToStr(prop["contact:email"]);
  var www =  uToStr(prop["contact:website"]);
  var phone = uToStr(prop["contact:phone"]);
  var facebook = uToStr(prop["facebook"]);
  var twitter = uToStr(prop["twitter"]);
  var note =  uToStr(prop["note"]);
  var house = uToStr(prop["addr:housenumber"]);
  var street = uToStr(prop["addr:street"]);
  var postcode = uToStr(prop["addr:postcode"]);
  var city = uToStr(prop["addr:city"]);

return (name?("Contact : "+name):"") +  (house?(" "+house):"") + (street?(" "+street):"") + (postcode?(" "+postcode):"") + (city?(" "+city):"") + "<br>" + (email?("<a href='mailto:"+email+"'><img src='/svg/social/Email_icon.svg'></a>"):"") + (www?("<a href='"+www+"'><img src='/svg/social/www_icon.svg'></a>"):"") + (phone?("<a href='tel:"+phone+"'>"+phone+"</a>"):"") + (facebook?("<a href='"+facebook+"'><img src='/svg/social/Facebook_icon.svg'></a>"):"") + (twitter?("<a href='"+twitter+"'><img src='/svg/social/Twitter_icon.svg'></a>"):"")+"<br>"+(note?(" "+note):"");

}

function manageUndefinedTag(feature){
  // means, you have a feature, but no social_facility property in umap flow

  var prop = feature.properties;
  var coordinates = feature.geometry.coordinates;
  var node_id = feature.properties.id;

  // "description" ==> "convoy", "office" or terms separated by commas
  
  var descriptions = feature.properties["description"]?feature.properties["description"].toLowerCase():"no description";

  descriptions.split(",").forEach(function(description,index){
    description = description.trim();
    for(i=0;i<propertyEmojis.length;i++){
      
      var umap_k = propertyEmojis[i];
      if (umap_k.umap.indexOf(description)!=-1){
        var vibe = umap_k.description+"<br>"+getVibe(feature);

        var icon = umap_k.kricket;
        updateOrInsertTag(node_id,description,coordinates,icon,vibe);
        break;
      }else{
        if (description!="no description")
          console.log("manageUndefinedTag : feature " + feature.properties["id"] + " not implemented : " + description)
      }
    }
  });
}

function updateOrInsertTag(node_id,property,coordinates,icon,vibe){

  // if coordinates, icon, vibe
  var atmos = Atmos.findOne({"properties.id":node_id,"properties.umap_property":property,"properties.type":"umap"});

  if (!atmos){
    console.log("Adding updateOrInsertTag : "+node_id);
    var d = new Date();
    d.setDate(d.getDate()+1000);
    Atmos.insert({
      latlng : { lat:coordinates[1],lng:coordinates[0]},
      createdUserId: "0",
      icon: icon,
      category: "refugee",
      vibe: vibe,
      createdUserName: "umap import",
      readByFollower: [{"userId": "0"}],
      time:new Date(),
      timeLimit: d,
      properties:{
        id:node_id,
        umap_property:property,
        type:"umap"
      }
    });
  }else{
    // check that coordinates, icon, vibe are the same
    if ((atmos.latlng.lat != coordinates[1]) || (atmos.latlng.lng != coordinates[0]) || (atmos.icon != icon) || (atmos.vibe!=vibe)){
      Atmos.update({
        _id:atmos._id
      },
        {
          "$set":{
          latlng : { 
            lat:coordinates[1],lng:coordinates[0]
          },
          vibe: vibe,
          icon: icon
          }
        });
    }
  }
}


function managePropertiesOfTag(feature){

  var properties = feature.properties;
  var coordinates = feature.geometry.coordinates;
  var node_id = feature.properties.id;
// We will search for properties set
for (var property in properties){
  for(index=0;index<propertyEmojis.length;index++){
    var umap_k = propertyEmojis[index];
      // .umap content is array
      if ((umap_k.umap.indexOf(property)!=-1) && properties[property]=="yes"){
        updateOrInsertTag(node_id,property,coordinates,umap_k.kricket,umap_k.description + "<br>" +getVibe(feature));
        }   
      }
    }

  }

  function removeUmapTagsNotUsed(nodesUsed){

    atmos = Atmos.find({"properties.type":"umap","properties.umap_social_facility":{$exists:true}}).fetch().map(function(item){
      return item.properties.id;
    });

    var removedId = [];

    atmos.forEach(function(element,index){
      if ((nodesUsed.indexOf(element)==-1) && (removedId.indexOf(element)==-1)){
        removedId.push(element);
        console.log("Remove node element : "+element);
        Atmos.remove({"properties.type":"umap","properties.id":element});
      }
    });

  }

// Properties not used (no icon for now)
// constant_flow
// refugee
// temporary
// interpreters
// non-food_items
// EVI_assistance ((extremely vulnerable individuals) assistance )

function updateOrInsertIntoKricketFromUmap(urls){

  var nodeIds = [];

  urls.forEach(function(url,index){


    result = HTTP.get(url);
    var descriptions=[];
    var social_facilities=[];

  //console.log("result.data : "+result.data);
  jsonData = result.data;

  if (result.data && jsonData.features){
    jsonData.features.forEach(function(feature,index){

      if (feature && feature.properties && feature.properties.id){


        if (feature.properties.social_facility && social_facilities.indexOf(feature.properties.social_facility)==-1)
          social_facilities.push(feature.properties.social_facility);

        nodeIds.push(feature.properties.id);

        feature = sanitizeDataProperties(feature);

        var atmos = Atmos.findOne({"properties.id":feature.properties.id,"properties.umap_social_facility":feature.properties.social_facility,"properties.type":"umap"});
        var vibe = feature.properties.name  + "<br>" +getVibe(feature);
        switch(feature.properties.social_facility){
          case "refugee_camp":
            //update main camp

            if (!atmos){

              // check if node is not there but without social_facility or another one, we have to remove it !
              if (Atmos.findOne({"properties.id":feature.properties.id,type:"umap"}))
                Atmos.remove({"properties.id":feature.properties.id,type:"umap"});


              var d = new Date();
              d.setDate(d.getDate()+1000);
              
              Atmos.insert({
                latlng : { lat:feature.geometry.coordinates[1],lng:feature.geometry.coordinates[0]},
                createdUserId: "0",
                icon: "01_house",
                category: "refugee",
                vibe: vibe,
                createdUserName: "umap import",
                readByFollower: [{"userId": "0"}],
                time:new Date(),
                timeLimit: d,
                properties:{
                  id:feature.properties.id,
                  umap_social_facility:"refugee_camp",
                  type:"umap"
                }
              });
            }else{
              // update if something change !
              if (atmos.vibe!=vibe){
                console.log("updating content for "+feature.properties.id);
                Atmos.update({_id:atmos._id},{$set:{vibe:vibe}});
              }
              // first the main,

              // then just properties on coordinates
            }
            managePropertiesOfTag(feature);
            break;

            case "asylum centre":
              // 01_house
              // feature.properties.id
              break;

              default :
          // if not set just 
          var description = uToStr(feature.properties["description"]);

          if (description && (descriptions.indexOf(description)==-1))
            descriptions.push(description);

          manageUndefinedTag(feature);

          break;
        }
      }else{
        console.error("Feature properties are not there");
        return;
      }
    });

}
else{
  console.error("Error json data not there");
}

console.log("Facilities in url : " + url + " : " + JSON.stringify(social_facilities));
console.log("Descriptions in url : " + url + " : " + JSON.stringify(descriptions));

});

removeUmapTagsNotUsed(nodeIds);



}



// Execution

//updateOrInsertIntoKricketFromUmap(["http://umap.openstreetmap.fr/en/datalayer/128186/","http://umap.openstreetmap.fr/en/datalayer/125665/","http://umap.openstreetmap.fr/en/datalayer/123627/","http://umap.openstreetmap.fr/en/datalayer/123811/"]);


// // // Refering to https://github.com/percolatestudio/meteor-synced-cron
// SyncedCron.add({
//   name: 'Import UMAP datas',
//   schedule: function(parser) {
//     return parser.text('every 12 hours');
//   }, 
//   job: function() {
//console.log("Import UMAP datas running");


//   }
// });

// SyncedCron.start();