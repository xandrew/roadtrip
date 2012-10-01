function Pather(map, set_active_callback) {
  var directions_service_ = new google.maps.DirectionsService();
  var path_line_;

  var div_ = $('<div></div>');
  var start_ = $('<div></div>');
  div_.append(start_);

  var redraw_button_ = $('<button>Redraw</button>');
  div_.append(redraw_button_);

  function PathStep(previous_step, next_step) {
    var prev_ = previous_step;
    var next_ = next_step;

    var outer_div_ = $('<div></div>');
    var step_div_ = $('<div></div>');
    var input_ = $('<input type=text></input>');

    var directions_to_renderer_;

    step_div_.append(input_);

    outer_div_.append(step_div_);
    var stop_;

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

    function reDraw() {
      if (prev_ !== undefined) {
	var dir_request = {
	  origin: prev_.Value(),
	  destination: api_.Value(),
	  provideRouteAlternatives: false,
	  travelMode: google.maps.TravelMode.WALKING,
	  unitSystem: google.maps.UnitSystem.METRIC
	};
	directions_service_.route(dir_request, receiveDirections);
      }
    }

    var api_ = {
      Div: function() { return outer_div_; },
      Next: function() { return next_; },
      Prev: function() { return prev_; },
      SetNext: function(next) { next_ = next; },
      SetPrev: function(prev) { prev_ = prev; },
      Value: function() { return input_.val(); },
      GetStop: function() { return stop_; },
      ReDraw: reDraw
    };

    var pin_button_ = $('<button>!</button>');
    step_div_.append(pin_button_);
    pin_button_.click(
      function() {
	google.maps.event.addListenerOnce(map, 'click', function(e) {
					    input_.val(e.latLng.toString());
					  });
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
      function() {
	if ((prev_ !== undefined) && (next_ !== undefined)) {
	  prev_.SetNext(next_);
	  next_.SetPrev(prev_);
	  outer_div_.remove();
	  if (directions_to_renderer_ !== undefined) {
	    directions_to_renderer_.setMap(null);
	  }
	}
      });

    var stop_button_ = $('<button>StopHere</button>');
    function addStopButton() {
      step_div_.append(stop_button_);
      stop_button_.click(
	function() {
	  stop_ = Stop(set_active_callback);
	  outer_div_.append(stop_.GetDiv());
	  stop_button_.remove();
	  //stop_.OnRemove(addStopButton);
	});
    }

    addStopButton();
    return api_;
  }

  var first_step_ = PathStep();

  function reDraw() {
    var act_step = first_step_;
    while (act_step !== undefined) {
      act_step.ReDraw();
      act_step = act_step.Next();
    }
  }

  redraw_button_.click(reDraw);

  return {
    GetDiv: function() { return div_; },
    GetFirstStep: function() { return first_step_; },
    ReDraw: function(on_ready) {
      reDraw();
    }
  };
}
