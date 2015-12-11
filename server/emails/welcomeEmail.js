/*
*	welcomeEmail.js
*	Send email from template /private/welcomeEmail.html
*/
sendEmailForNewUser =function(name,email){
    var html = "<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">"+SSR.render('welcomeEmail', {userName: name});
    Email.send({
      to: email,
      from: "hello@kricket.co",
      subject: "Hey! Welcome Aboard",
      html: html
    });
    return true;
}