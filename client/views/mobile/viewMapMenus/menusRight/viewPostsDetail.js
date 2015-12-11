/*
*   viewPostsDetail.js
*/
karmaPostDetailRenderingView = null;

/* Helpers */

Template.viewPostsDetail.helpers({
  center: function() {
    return {
      atmosId: this.atmosId,
      fromMap: false
    };
  }
})

/* Methods */

Template.viewPostsDetail.created = function() {
  this.atmosId = this.data.atmosId;
};

Template.viewPostsDetail.hideAllTags = function() {
  if (karmaPostDetailRenderingView){
    Blaze.remove(karmaPostDetailRenderingView);
    karmaPostDetailRenderingView=null;
  }
  setTimeout(function() {
    $('#postViewDetail').show();
  }, 500);
  $("#postViewDetail").removeClass('slideInLeft').addClass('slideOutLeft');
}

Template.viewPostsDetail.showPostViewDetail = function(atmosId) {
  console.log("showPostViewDetail");
  var parent = document.getElementById("map-container");
  $("#postViewDetail").removeClass('slideOutLeft').addClass('slideInLeft');

  Template.viewPostsDetail.hideAllTags();
  karmaPostDetailRenderingView = Blaze.renderWithData(Template.viewPostsDetail, {
    atmosId: atmosId
  }, parent);
  Template.viewTagMenu.showTagMenu(atmosId);
}

Template.viewPostsDetail.removePostViewDetail = function() {
  if (karmaPostDetailRenderingView)
    setTimeout(function(){
      Blaze.remove(karmaPostDetailRenderingView);
      karmaPostDetailRenderingView = null;
    },500);
  $("#postViewDetail").removeClass('slideInLeft').addClass('slideOutLeft').show();
  Template.map.invisibleMapButtons();
}
