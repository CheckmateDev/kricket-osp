/*
*   buttonAnimation.js
*   Button Animation 
*   Let animation end on an event fired.
*/

buttonAnimationWithHoverClass = function (e){
    e.preventDefault();
    var classes = $(e.currentTarget).attr("class");
    classes+=" hover";
    $(e.currentTarget).attr("class",classes);
    $(e.currentTarget).off("webkitAnimationEnd mozAnimationEnd animationEnd");
    $(e.currentTarget).bind("webkitAnimationEnd mozAnimationEnd animationEnd", function(){
        console.log("end event");
        var classes = $(this).attr("class").replace(" hover","");
        $(this).attr("class",classes);
    });
}