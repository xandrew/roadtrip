function Editor(roadtrip_id) {
  var map_ = new google.maps.Map(
    $("#map_canvas").get(0),
    {
      center: new google.maps.LatLng(-34.397, 150.644),
      zoom: 8,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

  var div_ = $('#editor_controlls');
  var projector_ = $('#projector');
  var current_stop_;
  
  var main_collection_ = ThumbCollection();
  var pather_ = Pather(map_, main_collection_);

  div_.append(pather_.GetDiv());

  div_.append($('<div>Remaining images</div>'));
  div_.append(main_collection_.GetDiv());
  div_.append(BreakDiv());

  function toJSON() {
    
  }

  $.getJSON('/all_images',
	    {
	      id: roadtrip_id
	    },
	    function(image_urls) {
	      for (var i = 0; i < image_urls.length; i++) {
		var thumb = Thumb(projector_, image_urls[i].thumb, image_urls[i].url);
		thumb.AppendTo(main_collection_);
		thumb.ShowMinus(function(clicked_thumb) { clicked_thumb.Remove(); });    
		thumb.ShowPlus(
		  function(clicked_thumb) {
		    clicked_thumb.Remove();
		    clicked_thumb.AppendTo(
		      pather_.GetActiveStep().GetCollection());
		    clicked_thumb.HidePlus();
		  });
	      }
	    });
}
