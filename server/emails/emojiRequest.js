/*
*	emojiRequest.js
*	Send email from template /private/welcomeEmail.html
*/

emojiRequest =function(req,email){
    var html = "<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">"+SSR.render('emojiRequest', {email:email,req:req});
    Email.send({
      to: 'hello@kricket.co',
      from: "hello@kricket.co",
      subject: "New user request for emoji",
      html: html
    });
    return true;
}