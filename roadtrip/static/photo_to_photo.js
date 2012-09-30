// Constants
var tick = 5;
var drive_length = 5000;
var car_height_px = 48;
var car_width_px = 21;
var full_length;
var path;

// Animation vars
var enabled;
var current_dist;
var current_leg;
var finished_legs_length;

var map;
var car;
var gallery;

var directionsService = new google.maps.DirectionsService();

function Gallery(image_urls) {
  var div_ = $('<div class="gallery"></div>');
  var api_ = {};
  var current_ = 0;
  var mouse_moved_ = true;
  var timer_ = null;

  var images_ = new Array();
  for (i = 0; i < image_urls.length; i++) {
    var image_class = 'bigimage';
    if (i !== current_) {
      image_class += ' hidden';
    }
    images_[i] = $(
      '<img src="' + image_urls[i] + '" class="' + image_class + '"/>');
    div_.append(images_[i]);
  }

  var left_nav_ = $('<div class="gallery_nav left hidden"><div class="arrow">&lt;</div></div>');
  var right_nav_ = $('<div class="gallery_nav right"><div class="arrow">&gt;</div></div>');
  div_.append(left_nav_);
  div_.append(right_nav_);

  api_.getDiv = function() {
    return div_;
  };

  api_.goNext = function() {
    if (current_ >= images_.length - 1) {
      return;
    }
    current_++;
    images_[current_].removeClass('hidden');
  };

  api_.goBack = function() {
    if (current_ == 0) {
      return;
    }
    images_[current_].addClass('hidden');
    current_--;
  };

  var tick_ = function() {
    if (mouse_moved_ && (current_ > 0)) {
      left_nav_.removeClass('hidden');
    } else {
      left_nav_.addClass('hidden');
    }
    if (mouse_moved_ && (current_ < images_.length - 1)) {
      right_nav_.removeClass('hidden');
    } else {
      right_nav_.addClass('hidden');
    }
    mouse_moved_ = false;
  };

  api_.install = function(parent) {
    parent.append(div_);
    right_nav_.click(api_.goNext);
    left_nav_.click(api_.goBack);
    div_.mousemove(function(e) {
		     mouse_moved_ = true;
		   });
    timer_ = setInterval(tick_, 100);
  };

  api_.remove = function() {
    div_.remove();
    clearInterval(timer_);
  };

  return api_;
}


function CarOverlay() {
  this.div_ = null;
  this.setMap(map);
}
CarOverlay.prototype = new google.maps.OverlayView();

CarOverlay.prototype.onAdd = function() {
  // Create the DIV and set some basic attributes.
  var div = document.createElement('DIV');
  div.style.width = car_width_px + "px";
  div.style.height = car_height_px + "px";
  div.className = "car";
  var img = document.createElement("img");
  img.src = "car.png";
  img.className = "car_image";
  div.appendChild(img);
  
  this.div_ = div;
  this.hide();
  this.pos_ = new google.maps.LatLng(-34.397, 150.644);
  
  var panes = this.getPanes();
  panes.overlayImage.appendChild(div);
};

CarOverlay.prototype.screenPosition = function() {
  var overlayProjection = this.getProjection();
  return overlayProjection.fromLatLngToDivPixel(this.pos_);
};

CarOverlay.prototype.draw = function() {
  var pos = this.screenPosition();
  
  this.div_.style.left = (pos.x - car_width_px/2) + 'px';
  this.div_.style.top = (pos.y - car_height_px/2) + 'px';
  $(this.div_).css("-webkit-transform", "rotate(" + this.heading_ + "deg)");
};

CarOverlay.prototype.onRemove = function() {
  this.div_.parentNode.removeChild(this.div_);
  this.div_ = null;
};

CarOverlay.prototype.getPosition = function(pos, heading) {
  return this.pos_;
};

CarOverlay.prototype.setPosition = function(pos, heading) {
  // Set positions.
  this.pos_ = pos;
  this.heading_ = heading;
  
  // Pan the map if necessary.
  var overlayProjection = this.getProjection();
  var bounds = new google.maps.LatLngBounds(pos, pos);
  coord_pos = overlayProjection.fromLatLngToDivPixel(pos);
  max_diam = Math.max(car_width_px, car_height_px);
  bounds.extend(overlayProjection.fromDivPixelToLatLng(
    new google.maps.Point(coord_pos.x + max_diam,
                          coord_pos.y + max_diam)));
  bounds.extend(overlayProjection.fromDivPixelToLatLng(
    new google.maps.Point(coord_pos.x + max_diam,
                          coord_pos.y - max_diam)));
  bounds.extend(overlayProjection.fromDivPixelToLatLng(
    new google.maps.Point(coord_pos.x - max_diam,
                          coord_pos.y - max_diam)));
  bounds.extend(overlayProjection.fromDivPixelToLatLng(
    new google.maps.Point(coord_pos.x - max_diam,
                          coord_pos.y + max_diam)));
  map.panToBounds(bounds);

//  map.setCenter(pos);
  
  // Redraw.
  this.draw();
}

CarOverlay.prototype.hide = function() {
  if (this.div_) {
    this.div_.style.visibility = "hidden";
  }
};

CarOverlay.prototype.show = function() {
  if (this.div_) {
    this.div_.style.visibility = "visible";
  }
};

function initialize() {
  var myOptions = {
    center: new google.maps.LatLng(-34.397, 150.644),
    zoom: 8,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true
  };
  map = new google.maps.Map(document.getElementById("map_canvas"),
			    myOptions);
  car = new CarOverlay();

  gallery = Gallery(['1.jpg', '2.jpg', '3.jpg']);
  gallery.install($('#main_screen'));
}

function buttonClick() {
  var dir_request = {
    origin: $("#from").val(),
    destination: $("#to").val(),
    provideRouteAlternatives: false,
    travelMode: google.maps.TravelMode.DRIVING,
    unitSystem: google.maps.UnitSystem.METRIC
  };
  directionsService.route(dir_request, receiveDirections);
}
function receiveDirections(result, status) {
  if (status != google.maps.DirectionsStatus.OK) {
    alert("Error");
  } else {
    path = result.routes[0].overview_path;
    full_length = google.maps.geometry.spherical.computeLength(path);
    pathLine = new google.maps.Polyline({
      path: result.routes[0].overview_path,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2});
    pathLine.setMap(map);
    
    enabled = true;
    current_dist = 0.;
    current_leg = 0;
    finished_legs_length = 0.;
    refreshCar();
    car.show();
    map.panTo(path[0]);
    first_to_map();
  }
}
function refreshCar() {
  current_leg_start = path[current_leg];
  current_leg_end = path[current_leg + 1];
  current_leg_length =
    google.maps.geometry.spherical.computeDistanceBetween(
      current_leg_start, current_leg_end);
  leg_ratio = (current_dist - finished_legs_length) /
    current_leg_length;
  car.setPosition(
    google.maps.geometry.spherical.interpolate(
      current_leg_start, current_leg_end, leg_ratio),
    google.maps.geometry.spherical.computeHeading(
      current_leg_start, current_leg_end));
}

function animate() {
  if (enabled) {
    step_length = full_length / (drive_length / tick);
    current_dist += step_length;

    if (current_dist <= full_length) {
      setTimeout("animate()", tick);
      var current_leg_start;
      var current_leg_end;
      var current_leg_length;
      do {
	current_leg_start = path[current_leg];
	current_leg_end = path[current_leg + 1];
	current_leg_length =
          google.maps.geometry.spherical.computeDistanceBetween(
	    current_leg_start, current_leg_end);
	current_leg++;
	finished_legs_length += current_leg_length;
      } while (current_dist > finished_legs_length);
      current_leg--;
      finished_legs_length -= current_leg_length;
      refreshCar();
    } else {
      enabled = false;
      map_to_second();
      //map.panTo(path[path.length - 1]);
    }
  }
}

function first_to_map() {
  gallery.getDiv().on('webkitTransitionEnd', function(e) {
			if (e.target !== this) {
			  return;
			}
			gallery.remove();
			gallery = Gallery(['3.jpg', '4.jpg']);
			gallery.getDiv().addClass("hidden");
			gallery.install($('#main_screen'));
			animate();
		      });
  gallery.getDiv().addClass("hidden");
  $("#map_container").removeClass("hidden");
  $("#map_container").removeClass("zoomed");
}

function map_to_second() {
  var projection = car.getProjection();
  var car_position = projection.fromLatLngToDivPixel(car.getPosition());
  var map_center = projection.fromLatLngToDivPixel(map.getCenter());

  x_trans = map_center.x - car_position.x;
  y_trans = map_center.y - car_position.y;

  jss('#map_container.zoomed').set(
      '-webkit-transform',
      'scale(10) translate(' + x_trans + 'px, '+ y_trans + 'px)');
  $("#map_container").addClass("zoomed");

  gallery.getDiv().removeClass("hidden");
}
