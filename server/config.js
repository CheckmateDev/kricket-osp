/*
*   config.js
*   Config
*/

/* Change version of emojis sprites each time you want to edit emojis in .public/tags/[categories]/*.svg */
versionOfEmojis = "1.5.10";

Meteor.startup(function () {

  smtp = {
    username: 'xxxxxxxxxxxxxxxx',   // eg: server@gentlenode.com
    password: 'yyyyyyyyyyyyyyyyyyy',   // eg: 3eeP1gtizk5eziohfervU
    server:   'smtp.gmail.com',  // eg: mail.gandi.net
    port: 465
  }

  process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;

/* compiling email templates */
  SSR.compileTemplate('welcomeEmail',Assets.getText('welcomeEmail.html'));
  SSR.compileTemplate('emojiRequest',Assets.getText('emojiRequest.html'));
  SSR.compileTemplate('atmosphereAlert',Assets.getText('atmosphereAlert.html'));

});