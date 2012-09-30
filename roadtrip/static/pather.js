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

  $('#drive').click(function() {
		      var dir_request = {
			origin: $("#from").val(),
			destination: $("#to").val(),
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
      path_line_ = new google.maps.Polyline(
	{
	  path: result.routes[0].overview_path,
	  strokeColor: "#FF0000",
	  strokeOpacity: 1.0,
	  strokeWeight: 2,
	  editable: true});
      path_line_.setMap(map_);
    }
  }
}
