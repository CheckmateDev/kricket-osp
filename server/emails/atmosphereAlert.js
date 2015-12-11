/*
*	atmosphereAlert.js
*/
atmosphereAlert=function(atmosId){
    var html = "<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">"+SSR.render('atmosphereAlert', {atmosId:atmosId,url:Meteor.absoluteUrl()});
    Email.send({
      to: 'hello@kricket.co',
      from: "hello@kricket.co",
      subject: "User report atmosphere with offensive content",
      html: html
    });

    return true;
}
