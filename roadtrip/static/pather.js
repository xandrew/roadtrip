function Pather() {
  var map_;
  var directions_service_ = new google.maps.DirectionsService();
  var path_line_;

  map_ = new google.maps.Map(
    $("#map_canvas").get(0),
    {
      center: new google.maps.LatLng(-34.397, 150.644),
      zoom: 8,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

  var div_ = $('#route_controlls');
  var title_ = $('#rc_title');

  var path_steps_ = [];

  function PathStep(previous_step, next_step) {
    var prev_ = previous_step;
    var next_ = next_step;

    var step_div_ = $('<div></div>');
    var input_ = $('<input type=text></input>');
    step_div_.append(input_);

    if (prev_ !== undefined) {
      step_div_.insertAfter(prev_.Div());
    } else {
      step_div_.insertAfter(title_);
    }

    var api_ = {
      'Div': function() { return step_div_; },
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
	google.maps.event.addListenerOnce(map_, 'click', function(e) {
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
	  step_div_.remove();
	}
      });

  
    return api_;
  }

  var first_step_ = PathStep();

  $('#drive').click(
    function() {
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
    });
  function receiveDirections(result, status) {
    if (status != google.maps.DirectionsStatus.OK) {
      alert("Error");
    } else {
      var path = result.routes[0].overview_path;
      console.log(JSON.stringify(path));
      map_.panTo(path[0]);
      if (path_line_ !== undefined) {
	path_line_.setMap(null);
      }
      path_line_ = new google.maps.Polyline(
	{
	  path: result.routes[0].overview_path,
	  strokeColor: "#FF0000",
	  strokeOpacity: 1.0,
	  strokeWeight: 2});
      path_line_.setMap(map_);
    }
  }
}
