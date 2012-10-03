function Pather(map, default_thumb_collection) {
  var directions_service_ = new google.maps.DirectionsService();
  var geocoder_ = new google.maps.Geocoder();
  var path_line_;
  var active_step_;

  var div_ = $('<div></div>');
  var start_ = $('<div></div>');
  div_.append(start_);

  function PathStep(previous_step, next_step) {
    var prev_ = previous_step;
    var next_ = next_step;

    var outer_div_ = $('<div class="path_step"></div>');
    var step_div_ = $('<div></div>');
    var input_ = $('<input type=text></input>');

    var marker_;
    var directions_to_renderer_;

    var thumb_collection_ = ThumbCollection();

    step_div_.append(input_);

    outer_div_.append(step_div_);
    outer_div_.append(thumb_collection_.GetDiv());

    if (prev_ !== undefined) {
      outer_div_.insertAfter(prev_.Div());
    } else {
      outer_div_.insertAfter(start_);
    }

    function receiveDirections(result, status) {
      if (status != google.maps.DirectionsStatus.OK) {
	alert("Error: " + status);
      } else {
	if (directions_to_renderer_ !== undefined) {
	  directions_to_renderer_.setMap(null);
	}
	directions_to_renderer_ = new google.maps.DirectionsRenderer();
	directions_to_renderer_.setOptions(
	  {
	    draggable: true,
	    preserveViewport: true,
	    suppressMarkers: true
	  });
	directions_to_renderer_.setMap(map);
	directions_to_renderer_.setDirections(result);
      }
    }

    function reDrawInto() {
      if (prev_ !== undefined && api_.Value() != '' && prev_.Value() != '') {
	var dir_request = {
	  origin: prev_.Value(),
	  destination: api_.Value(),
	  provideRouteAlternatives: false,
	  travelMode: google.maps.TravelMode.WALKING,
	  unitSystem: google.maps.UnitSystem.METRIC
	};
	directions_service_.route(dir_request, receiveDirections);
      } else {
	if (directions_to_renderer_ !== undefined) {
	  directions_to_renderer_.setMap(null);
	  directions_to_renderer_ = undefined;
	}
      }
    }

    function removeMarker() {
      if (marker_ !== undefined) {
	marker_.setMap(null);
	marker_ = undefined;
      }
    }

    function receiveGeoCode(result, status) {
      removeMarker();
      if (status == google.maps.GeocoderStatus.OK && result.length > 0) {
	marker_ = new google.maps.Marker(
	  {
	    animation: google.maps.Animation.DROP,
	    draggable: true,
	    map: map,
	    position: result[0].geometry.location
	  });
	google.maps.event.addListener(
	  marker_,
	  'dragend',
	  function() {
	    input_.val(marker_.getPosition().toString());
	    valueChanged();  
	  });
	map.panTo(marker_.getPosition());
      }
    }

    function reDrawMarker() {
      if (api_.Value() != '') {
	geocoder_.geocode({ address: api_.Value() }, receiveGeoCode);
      } else {
	removeMarker();
      }
    }

    function valueChanged() {
      reDrawMarker();
      reDrawInto();
      if (next_ !== undefined) {
	next_.ReDrawInto();
      }
    }

    function remove() {
      prev_.SetNext(next_);
      next_.SetPrev(prev_);
      outer_div_.remove();
      if (directions_to_renderer_ !== undefined) {
	directions_to_renderer_.setMap(null);
      }
      removeMarker();
      var thumb = thumb_collection_.PopLast();
      while (thumb !== undefined) {
	default_thumb_collection.Prepend(thumb);
	thumb = thumb_collection_.PopLast();
      }
    }

    var api_ = {
      Div: function() { return outer_div_; },
      Next: function() { return next_; },
      Prev: function() { return prev_; },
      SetNext: function(next) { next_ = next; },
      SetPrev: function(prev) { prev_ = prev; reDrawInto(); },
      Value: function() { return input_.val(); },
      GetCollection: function() { return thumb_collection_; },
      Activate: function() {
	if (active_step_ === api_) {
	  return;
	}
	if (active_step_ !== undefined) {
	  active_step_.Deactivate();
	}
	active_step_ = api_;
	outer_div_.css('background-color', 'grey');
      },
      Deactivate: function() {
	outer_div_.css('background-color', 'white');
      },
      ReDrawInto: reDrawInto
    };

    var pin_button_ = $('<button>!</button>');
    step_div_.append(pin_button_);
    pin_button_.click(
      function() {
	google.maps.event.addListenerOnce(map, 'click', function(e) {
					    input_.val(e.latLng.toString());
					    valueChanged();
					  });
      });

    input_.blur(function() {
		  valueChanged();
		});


    var add_button_ = $('<button>+</button>');
    step_div_.append(add_button_);
    add_button_.click(
      function() {
	next_ = PathStep(api_, next_);
	if (next_.Next() !== undefined) {
	  next_.Next().SetPrev(next_);
	}
      });

    var remove_button_ = $('<button>-</button>');
    step_div_.append(remove_button_);
    remove_button_.click(
      function () {
	if ((prev_ !== undefined) && (next_ !== undefined)) {
	  remove();
	}
      });

    outer_div_.click(function() { api_.Activate(); });
    outer_div_.find('input').focus(function() { api_.Activate(); });
    outer_div_.find('button').focus(function() { api_.Activate(); });

    return api_;
  }

  var first_step_ = PathStep();
  first_step_.Activate();

  function reDraw() {
    var act_step = first_step_;
    while (act_step !== undefined) {
      act_step.ReDrawInto();
      act_step = act_step.Next();
    }
  }

  return {
    GetDiv: function() { return div_; },
    GetFirstStep: function() { return first_step_; },
    ReDraw: function(on_ready) {
      reDraw();
    },
    GetActiveStep: function() {
      return active_step_;
    }
  };
}
