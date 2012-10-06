function AniMap(map_canvas) {
  // Constants. For now at least...
  var tick = 5;
  var drive_length = 500;
  var car_height_px = 48;
  var car_width_px = 21;

  // Animation vars
  var path_;
  var enabled_ = false;
  var current_dist_;
  var current_leg_;
  var finished_legs_length_;
  var full_length_;

  // Objects on map.
  var car_;
  var path_line_;
  var car_img_;

  // Callbacks.
  var arrived_callback_;

  // Create/install map.
  var map_ = new google.maps.Map(map_canvas.get(0), {
				   center: new google.maps.LatLng(-34.397, 150.644),
				   zoom: 8,
				   mapTypeId: google.maps.MapTypeId.ROADMAP,
				   disableDefaultUI: true
				 });

  // Car overlay class - TODO: get rid of this prototype nonsense.
  function CarOverlay() {
    this.div_ = undefined;
    this.setMap(map_);
  }
  CarOverlay.prototype = new google.maps.OverlayView();

  CarOverlay.prototype.onAdd = function() {
    // Create the DIV and set some basic attributes.
    var div = document.createElement('DIV');
    div.style.width = car_width_px + "px";
    div.style.height = car_height_px + "px";
    div.className = "car";
    car_img_ = document.createElement("img");
    car_img_.src = "bicycle_turned.png";
    car_img_.className = "car_image";
    div.appendChild(car_img_);
    this.getPanes().overlayImage.appendChild(div);

    this.div_ = div;
    this.pos_ = new google.maps.LatLng(-34.397, 150.644);
  };

  CarOverlay.prototype.getDivPos = function() {
    return this.getProjection().fromLatLngToDivPixel(this.pos_);
  };

  CarOverlay.prototype.draw = function() {
    var div_pos = this.getDivPos();
  
    this.div_.style.left = (div_pos.x - car_width_px/2) + 'px';
    this.div_.style.top = (div_pos.y - car_height_px/2) + 'px';
    $(this.div_).css("-webkit-transform", "rotate(" + this.heading_ + "deg)");
  };

  CarOverlay.prototype.onRemove = function() {
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = undefined;
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
    var div_pos = this.getDivPos();
    var max_diam = Math.max(car_width_px, car_height_px);
    bounds.extend(overlayProjection.fromDivPixelToLatLng(
		    new google.maps.Point(div_pos.x + max_diam,
					  div_pos.y + max_diam)));
    bounds.extend(overlayProjection.fromDivPixelToLatLng(
		    new google.maps.Point(div_pos.x + max_diam,
					  div_pos.y - max_diam)));
    bounds.extend(overlayProjection.fromDivPixelToLatLng(
		    new google.maps.Point(div_pos.x - max_diam,
					  div_pos.y - max_diam)));
    bounds.extend(overlayProjection.fromDivPixelToLatLng(
		    new google.maps.Point(div_pos.x - max_diam,
					  div_pos.y + max_diam)));
    map_.panToBounds(bounds);
    
    // Redraw.
    this.draw();
  };

  car_ = new CarOverlay();

  function legLength_(index) {
    var leg_start = path_[index];
    var leg_end = path_[index + 1];
    return google.maps.geometry.spherical.computeDistanceBetween(
      leg_start, leg_end);
  }

  function refreshCar_() {
    var current_leg_start = path_[current_leg_];
    var current_leg_end = path_[current_leg_ + 1];
    var current_leg_length = legLength_(current_leg_);
    var leg_ratio = (current_dist_ - finished_legs_length_) /
      current_leg_length;
    car_.setPosition(
      google.maps.geometry.spherical.interpolate(
	current_leg_start, current_leg_end, leg_ratio),
      google.maps.geometry.spherical.computeHeading(
	current_leg_start, current_leg_end));
  }

  function animate_() {
    if (!car_.getProjection()) {
      return;
    }
    if (enabled_) {
      if (current_dist_ >= full_length_) {
	return;
      }
      var step_length = full_length_ / (drive_length / tick);
      current_dist_ += step_length;

      if (current_dist_ > full_length_) {
	current_dist_ = full_length_;
      }
      var current_leg_length;

      // Walk complete segments until we are over current dist.
      do {
	// TODO remove code duplication with refreshcar.
	current_leg_length = legLength_(current_leg_);
	current_leg_++;
	finished_legs_length_ += current_leg_length;
      } while (current_dist_ > finished_legs_length_);

      // Step one back.
      current_leg_--;
      finished_legs_length_ -= current_leg_length;

      refreshCar_();

      // Notify callback if finished.
      if ((current_dist_ === full_length_) &&
	  (arrived_callback_ !== undefined)) {
	arrived_callback_();
      }
    }
  }

  setInterval(animate_, tick);

  // Defining public API.
  var api_ = {};

  api_.getCanvas = function() {
    return map_canvas;
  };

  api_.initForPath = function(path) {
    path_ = path;
    full_length_ = google.maps.geometry.spherical.computeLength(path);
    if (path_line_ !== undefined) {
      path_line_.setOptions({ strokeColor: 'blue' });
    }
    path_line_ = new google.maps.Polyline(
      { path: path_,
	strokeColor: "#FF0000",
	strokeOpacity: 1.0,
	strokeWeight: 2 });
    path_line_.setMap(map_);
    enabled_ = false;
    current_dist_ = 0.;
    current_leg_ = 0;
    finished_legs_length_ = 0.;
    refreshCar_();
  };

  api_.centerOnCar = function() {
    map_.setCenter(car_.getPosition());
  };

  api_.start = function() {
    enabled_ = true;
  };

  api_.pause = function() {
    enabled_ = false;
  };

  api_.onArrival = function(arrived_callback) {
    arrived_callback_ = arrived_callback;
  };

  api_.carToCenterVector = function() {
    var projection = car_.getProjection();
    var car_position = projection.fromLatLngToDivPixel(car_.getPosition());
    var map_center = projection.fromLatLngToDivPixel(map_.getCenter());
     
    return { x: map_center.x - car_position.x,
	     y: map_center.y - car_position.y };
  };

  api_.setVehicle = function(vehicle_url) {
    car_img_.src = vehicle_url;
  };

  api_.getZoom = function() {
    return map_.getZoom();
  };

  api_.setZoom = function(zoom) {
    map_.setZoom(zoom);
  };

  return api_;
};
