function RoadTrip(roadtrip_id, num_stages) {
  var gallery_;
  var next_stage_ = 0;

  var directions_service_ = new google.maps.DirectionsService();

  var animap_ = AniMap($('#map_canvas'));

  function newGallery(images) {
  }

  function mapToSecond() {
    var trans = animap_.carToCenterVector();

    console.log(trans);
    
    jss('#map_container.zoomed').set(
      '-webkit-transform',
      'scale(10) translate(' + trans.x + 'px, '+ trans.y + 'px)');
    $("#map_container").addClass("zoomed");

    gallery_.getDiv().removeClass("hidden");
  }
  animap_.onArrival(mapToSecond);

  function startNewSegment(json_data) {
    var path = new Array();

    // Initialize map.
    $.each(json_data.path, function(key, val) {
	     var ll = new google.maps.LatLng(val.Xa, val.Ya);
	     path.push(ll);
	   });
    animap_.initForPath(path);

    animap_.setVehicle(json_data.vehicle);
    if (animap_.getZoom() != json_data.zoom) {
      animap_.centerOnCar();
      animap_.setZoom(json_data.zoom);
    }

    // What to phase out?
    var to_phase_out;
    if (gallery_ !== undefined) {
      to_phase_out = gallery_.getDiv();
    } else {
      animap_.centerOnCar();
      to_phase_out = $('#welcome_screen');
    }

    // Initialize new gallery.
    gallery_ = Gallery(json_data.images);
    gallery_.getDiv().addClass("hidden");
    gallery_.install($('#main_screen'));

    // Phase out start screen or old gallery, start map when done.
    $("#map_container").removeClass('zoomed');
    to_phase_out.on('webkitTransitionEnd',
		    function(e) {
		      if (e.target === this) {
			to_phase_out.remove();
			animap_.start();
		      }
		    });
    to_phase_out.addClass('hidden');
  }

  $('#drive_button').click(function() {
  			     $.getJSON('/get_map_path',
				       {
					 stage: next_stage_,
					 id: roadtrip_id
				       },
				       startNewSegment);
			     if (next_stage_ < num_stages - 1) {
			       next_stage_++;
			     }
  			   });
}
