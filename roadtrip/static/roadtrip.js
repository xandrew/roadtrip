function RoadTrip(roadtrip_id, num_stages) {
  var gallery_;
  var next_stage_ = 0;

  var directions_service_ = new google.maps.DirectionsService();

  var animap_ = AniMap($('#map_canvas'));

  function newGallery(images) {
  }

  function mapToGallery() {
    var trans = animap_.carToCenterVector();

    // Set translation so that we zoom right onto the car.
    jss('#map_container.zoomed').set(
      '-webkit-transform',
      'scale(10) translate(' + trans.x + 'px, '+ trans.y + 'px)');
    $("#map_container").addClass("zoomed");

    gallery_.getDiv().removeClass("hidden");
    gallery_.getDiv().on(
      'webkitTransitionEnd.phase_in_end',
      function(e) {
	if (e.target === this) {
	  gallery_.getDiv().off('webkitTransitionEnd.phase_in_end');
	  $("#map_container").removeClass("zoomed");
	  animap_.centerOnCar();
	  $('#button_pane').show();
	  switchToGallery();
	}
      });
  }
  animap_.onArrival(mapToGallery);

  function startNewSegment(json_data) {
    $('#button_pane').hide();

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
      to_phase_out = gallery_;
    } else {
      animap_.centerOnCar();
      to_phase_out = {
	remove: function() { $('#welcome_screen').remove(); },
	getDiv: function() { return $('#welcome_screen'); }
      };
    }

    // Initialize new gallery.
    gallery_ = Gallery(json_data.images);
    gallery_.getDiv().addClass("hidden");
    gallery_.install($('#main_screen'));

    // Phase out start screen or old gallery, start map when done.
    to_phase_out.getDiv().on(
      'webkitTransitionEnd.phase_out_end',
      function(e) {
	if (e.target === this) {
	  to_phase_out.getDiv().off('webkitTransitionEnd.phase_out_end');
	  to_phase_out.remove();
	  animap_.start();
	}
      });
    to_phase_out.getDiv().addClass('hidden');
  }

  $('#map_button').hide();
  $('#gallery_button').hide();

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

  function switchToMap() {
    $('.gallery').addClass('minimized');
    $('#map_button').hide();
    $('#gallery_button').show();
  }
  function switchToGallery() {
    $('.gallery').removeClass('minimized');
    $('#gallery_button').hide();
    $('#map_button').show();
  }

  $('#map_button').click(switchToMap);
  $('#gallery_button').click(switchToGallery);

  // Auto hiding of controlls on iddle mouse.
  var mouse_moved_ = true;
  var tick_ = function() {
    if (mouse_moved_) {
      $('.controlls').removeClass('hidden');
    } else {
      $('.controlls').addClass('hidden');
    }
    mouse_moved_ = false;
  };

  $('#main_screen').mousemove(function(e) {
				mouse_moved_ = true;
			      });
  setInterval(tick_, 100);
}
