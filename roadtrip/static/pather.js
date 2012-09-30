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
    step_div_.append(input_);

    outer_div_.append(step_div_);
    var stop_;

    if (prev_ !== undefined) {
      outer_div_.insertAfter(prev_.Div());
    } else {
      outer_div_.insertAfter(start_);
    }

    var api_ = {
      'Div': function() { return outer_div_; },
      'Next': function() { return next_; },
      'Prev': function() { return prev_; },
      'SetNext': function(next) { next_ = next; },
      'SetPrev': function(prev) { prev_ = prev; },
      'Value': function() { return input_.val(); }
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
      });      

    var remove_button_ = $('<button>-</button>');
    step_div_.append(remove_button_);
    remove_button_.click(
      function() {
	if ((prev_ !== undefined) && (next_ !== undefined)) {
	  prev_.SetNext(next_);
	  next_.SetPrev(prev_);
	  outer_div_.remove();
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
    var origin;
    var destination;
    var waypoints = [];
    var act_step = first_step_;
    while (act_step !== undefined) {
      var used = false;
      if (origin === undefined) {
	origin = act_step.Value();
	used = true;
      }
      var next_step = act_step.Next();
      if (next_step === undefined) {
	destination = act_step.Value();
	used = true;
      }
      if (!used) {
	waypoints.push({
			 location: act_step.Value(),
			 stopover: false
		       });
      }
      act_step = next_step;
    }
    var dir_request = {
      origin: origin,
      destination: destination,
      waypoints: waypoints,
      provideRouteAlternatives: false,
      travelMode: google.maps.TravelMode.WALKING,
      unitSystem: google.maps.UnitSystem.METRIC
    };
    directions_service_.route(dir_request, receiveDirections);
  }

  redraw_button_.click(reDraw);

  function receiveDirections(result, status) {
    if (status != google.maps.DirectionsStatus.OK) {
      alert("Error");
    } else {
      var path = result.routes[0].overview_path;
      console.log(JSON.stringify(path));
      map.panTo(path[0]);
      if (path_line_ !== undefined) {
	path_line_.setMap(null);
      }
      path_line_ = new google.maps.Polyline(
	{
	  path: result.routes[0].overview_path,
	  strokeColor: "#FF0000",
	  strokeOpacity: 1.0,
	  strokeWeight: 2});
      path_line_.setMap(map);
    }
  }

  return {
    GetDiv: function() { return div_; }
  };
}
