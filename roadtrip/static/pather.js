function Pather(map, default_thumb_collection, roadtrip_id, projector) {
  var directions_service_ = new google.maps.DirectionsService();
  var geocoder_ = new google.maps.Geocoder();
  var first_step_;
  var last_step_;
  var active_step_;

  var div_ = $('<div></div>');
  var start_ = $('<div></div>');
  div_.append(start_);

  function PathStep(json_spec, previous_step, next_step) {
    var prev_ = previous_step;
    var next_ = next_step;
    var vehicle_;
    var zoom_ = 10;

    var outer_div_ = $('<div class="path_step"></div>');
    var step_div_ = $('<div></div>');
    var input_ = $('<input type=text></input>');
    var vehicle_selector_ = $('<select>' + 
			      '<option value="bicycle">Bicycle</option>' +
			      '<option value="car">Car</option>' +
			      '<option value="plane">Airplane</option>' +
			      '<option value="train">Train</option>' +
			      '<option value="walk">Walk</option>' +
			      '</select>');
    var marker_;
    var directions_to_renderer_;
    var directions_real_;

    var thumb_collection_ = ThumbCollection(roadtrip_id, projector);
    thumb_collection_.AddRemoveButtonTemplate(
      '-',
      function(image_id) {
	default_thumb_collection.PrependImage(image_id);
      });

    step_div_.append(input_);

    outer_div_.append(step_div_);
    outer_div_.append(thumb_collection_.GetDiv());

    if (prev_ !== undefined) {
      outer_div_.insertAfter(prev_.Div());
    } else {
      outer_div_.insertAfter(start_);
    }

    function polyDirections(path) {
      directions_real_ = false;
      directions_to_renderer_ = new google.maps.Polyline({ path: path });
      directions_to_renderer_.setMap(map);
    }

    function realDirections(directions) {
      directions_real_ = true;
      directions_to_renderer_ = new google.maps.DirectionsRenderer();
      directions_to_renderer_.setOptions(
	{
	  draggable: true,
	  preserveViewport: true,
	  suppressMarkers: true
	});
      directions_to_renderer_.setDirections(directions);
      directions_to_renderer_.setMap(map);
    }

    function initFromJSON(json_spec) {
      if (json_spec.path !== undefined) {
	var path = new Array();
	$.each(json_spec.path, function(key, val) {
		 var ll = new google.maps.LatLng(val.Xa, val.Ya);
		 path.push(ll);
	       });
	polyDirections(path);
	vehicle_selector_.val(json_spec.vehicle);
	vehicle_ = json_spec.vehicle;
      }

      if (json_spec.marker !== undefined) {
	var marker_position = new google.maps.LatLng(json_spec.marker.Xa,
						     json_spec.marker.Ya);
	receiveGeoCode(
	  [{geometry: {location: marker_position}}],
	  google.maps.GeocoderStatus.OK);
      }

      if (json_spec.input_text !== undefined) {
	input_.val(json_spec.input_text);
      }

      if (json_spec.zoom !== undefined) {
	zoom_ = json_spec.zoom;
      }

      if (json_spec.images !== undefined) {
	for (var i = 0; i < json_spec.images.length; i++) {
	  thumb_collection_.AppendImage(json_spec.images[i]);
	}
      }
    }

    function toJSON() {
      var json_spec = {};
      json_spec.path = api_.GetPath();
      json_spec.vehicle = vehicle_;
      json_spec.input_text = input_.val();
      json_spec.zoom = zoom_;
      json_spec.images = [];
      json_spec.marker = marker_.getPosition();
      json_spec.images = thumb_collection_.GetImages();
      return json_spec;
    }

    initFromJSON(json_spec);

    function receiveDirections(vehicle, result, status) {
      if (status != google.maps.DirectionsStatus.OK) {
	alert("Error: " + status);
      } else {
	vehicle_ = vehicle;
	if (directions_to_renderer_ !== undefined) {
	  directions_to_renderer_.setMap(null);
	}
	if ((vehicle != 'plane') && (vehicle != 'train')) {
	  realDirections(result);
	} else {
	  var start = result.routes[0].overview_path[0];
	  var end = result.routes[0].overview_path.slice(-1)[0];
	  polyDirections([start, end]);
	}
      }
    }

    function reDrawInto() {
      if (prev_ !== undefined && api_.Value() != '' && prev_.Value() != '') {
	var vehicle = vehicle_selector_.val();
	var mode;
	if ((vehicle == 'car') || (vehicle == 'plane') || (vehicle == 'train')) {
	  mode = google.maps.TravelMode.DRIVING;
	} else {
	  mode = google.maps.TravelMode.WALKING;
	}
	var dir_request = {
	  origin: prev_.Value(),
	  destination: api_.Value(),
	  provideRouteAlternatives: false,
	  travelMode: mode,
	  unitSystem: google.maps.UnitSystem.METRIC
	};
	directions_service_.route(dir_request, function(result, status) {
				    receiveDirections(vehicle, result, status);
				  });
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
      var image_id = thumb_collection_.PopLast();
      while (image_id !== undefined) {
	default_thumb_collection.PrependImage(image_id);
	image_id = thumb_collection_.PopLast();
      }
    }

    var api_ = {
      Div: function() { return outer_div_; },
      Next: function() { return next_; },
      Prev: function() { return prev_; },
      SetNext: function(next) { next_ = next; },
      SetPrev: function(prev) { prev_ = prev; reDrawInto(); },
      Value: function() { return input_.val(); },
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
      GetPath: function() {
	if (directions_to_renderer_ === undefined) {
	  return undefined;
	}
	console.log(vehicle_);
	if (directions_real_) {
	  return directions_to_renderer_.getDirections().routes[0].overview_path;
	} else {
	  return directions_to_renderer_.getPath().getArray();
	}
      },
      GetVehicle: function() {
	return vehicle_;
      },
      GetZoom: function() {
	return zoom_;
      },
      AddAfter: function(json_spec) {
	next_ = PathStep(json_spec, api_, next_);
	if (next_.Next() !== undefined) {
	  next_.Next().SetPrev(next_);
	} else {
	  last_step_ = next_;
	}
      },
      AddImage: function(image_id) {
	thumb_collection_.AppendImage(image_id);
      },
      ReDrawInto: reDrawInto,
      ToJSON: toJSON
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
    add_button_.click(function() {
			api_.AddAfter({});
		      });

    var remove_button_ = $('<button>-</button>');
    step_div_.append(remove_button_);
    remove_button_.click(
      function () {
	if ((prev_ !== undefined) && (next_ !== undefined)) {
	  remove();
	}
      });

    var use_zoom_button_ = $('<button>Oo.</button>');
    step_div_.append(use_zoom_button_);
    use_zoom_button_.click(
      function () {
	zoom_ = map.getZoom();
	console.log('Zoom set to: ' + zoom_);
      });

    step_div_.append(vehicle_selector_);
    vehicle_selector_.change(reDrawInto);

    outer_div_.click(function() { api_.Activate(); });
    outer_div_.find('input').focus(function() { api_.Activate(); });
    outer_div_.find('button').focus(function() { api_.Activate(); });

    return api_;
  }

  function addStep(json_spec) {
    if (last_step_ === undefined) {
      first_step_ = PathStep(json_spec);
      last_step_ = first_step_;
      first_step_.Activate();
    } else {
      last_step_.AddAfter(json_spec);
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
    },
    AddStep: addStep,
    AddImageToActiveCollection: function(image_id) {
      active_step_.AddImage(image_id);
    }
  };
}
