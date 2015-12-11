/*
*   init.js
*   Translation apis
*/

i18n = null;

if (Meteor.isClient){

  var userLang = navigator.language || navigator.userLanguage; 
  var ul = userLang.substring(0,2);
  if (ul =="ar")
    Session.set("current-language","ar");
  else
    Session.set("current-language","us");

  // Method to get language
  i18n = function(code){
    return i18nHash[code][Session.get("current-language")];
  }

  // Global helper to get translations from views
  Template.registerHelper("i18n", function (code) {
      return i18nHash[code][Session.get("current-language")];
  });

}