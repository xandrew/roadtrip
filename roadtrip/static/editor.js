
function StopStarter(on_done, insert_after) {
  var div_ = $('<div></div>');
  var input_ = $('<input type=text></input>');
  div_.append(input_);
  var button_ = $('<button>OK</button>');
  div_.append(button_);
  insert_after.insertAfter(div_);
  
  var map_listener_ = google.maps.event.addListener(
    map_, 'click', function(e) {
      input_.val(e.latLng.toString());
    });

  return div_;
}

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
  
  var pather_ = Pather(map_, function(new_stop) {
			 if (current_stop_ !== undefined) {
			   current_stop_.DeActivate();
			 }
			 current_stop_ = new_stop;
		       });
  div_.append(pather_.GetDiv());

  var main_collection_ = ThumbCollection();
  div_.append($('<div>Remaining images</div>'));
  div_.append(main_collection_.GetDiv());
  div_.append(BreakDiv());

  $.getJSON('/all_images',
	    {
	      id: roadtrip_id
	    },
	    function(image_urls) {
	      for (var i = 0; i < image_urls.length && i < 15; i++) {
		var thumb = Thumb(projector_, image_urls[i]);
		thumb.AppendTo(main_collection_);
		thumb.ShowMinus(function(clicked_thumb) { clicked_thumb.Remove(); });    
		thumb.ShowPlus(function(clicked_thumb) {
				 if (current_stop_ !== undefined) {
				   clicked_thumb.Remove();
				   clicked_thumb.AppendTo(current_stop_.GetCollection());
				   clicked_thumb.HidePlus();
				 }
			       });
	      }
	    });
}
