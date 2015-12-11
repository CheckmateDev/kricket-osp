/*
*   accounts.js
*   Accounts
*/


/* Account guest used */
AccountsGuest.enable=true;
AccountsGuest.forced = false;

/* Email sending for non-guests */

Accounts.emailTemplates.siteName = "Kricket";
Accounts.emailTemplates.from = "hello@kricket.co";
Accounts.emailTemplates.enrollAccount.subject = function(user) {
  return "Password Reset Instruction, " + user.profile.name;
};

Accounts.emailTemplates.enrollAccount.text = function(user, url) {
  var forgetPasswordUrl = url.replace("#/", "");

  return "To activate your account, simply click the link below:\n\n"
  + forgetPasswordUrl + "\n\n"
  + "Please disregard this email if you have not requested password recovery.\n\n"
  + "Thanks, Kricket Team";
};


/* OnCreateUser callback */

Accounts.onCreateUser(function(options, user) {
  console.log("create user event");

  // create or update a user in Mixpanel Engage 
  mixpanel.people.set(user.username, {
    $userId: user._id,
    $username: user.username,
    $first_name: "",
    $last_name: user.username,    
    $created: (new Date()).toISOString(),
    karma:0
  });

  mixpanel.track("New user sign up");

  if (Meteor.users.find({email: user.email}).fetch == 0) {
    // Call to /server/emails/welcomeEmail.js method
    var email = "";
    if (user.services.facebook)
      email = user.services.facebook.email;
    else
      email = options.email;

    if (email)
      sendEmailForNewUser(options.profile.name,email);
  }

  if (options.profile)
    user.profile = options.profile;

  // default values for user
  user.packs = [];
  user.karma = 0;
  user.notificationOnShare = true
  user.notificationOnFollow = true
  user.notificationOnVote = true
  user.profile.preferredLanguage = "none";

  return user;
});