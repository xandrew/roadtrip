function Editor(roadtrip_id) {
  var map_ = new google.maps.Map(
    $("#map_canvas").get(0),
    {
      center: new google.maps.LatLng(-34.397, 150.644),
      zoom: 8,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

  var div_ = $('#editor_controlls');
  var projector_ = $('#projector');
  var current_stop_;
  var remaining_collection_ = ThumbCollection(roadtrip_id, projector_);
  var pather_ = Pather(map_, remaining_collection_, roadtrip_id, projector_);
  
  function toJSON() {
    var result = {};
    result.trip_id = roadtrip_id;
    result.stages = [];
    var actual_step = pather_.GetFirstStep();
    while (actual_step !== undefined) {
      result.stages.push(actual_step.ToJSON());
      actual_step = actual_step.Next();
    }
    result.trashed_images = [];
    console.log(JSON.stringify(result));
    $.post('/save',
	   {
	     id: roadtrip_id,
	     data: JSON.stringify(result)
	   });
  }

  function initialize(trip_data) {
    var save_button_ = $('<button>Save</button>');
    div_.append(save_button_);
    save_button_.click(toJSON);

    div_.append(pather_.GetDiv());
    for (var i = 0; i < trip_data.stages.length; i++) {
      pather_.AddStep(trip_data.stages[i]);
    }

    div_.append($('<div>Remaining images</div>'));
    div_.append(remaining_collection_.GetDiv());
    div_.append(BreakDiv());
    var remaining_images = trip_data.remaining_images;
    for (var i = 0; i < remaining_images.length; i++) {
      var thumb = remaining_collection_.AddImage(remaining_images[i]);
      thumb.ShowPlus(
	function(clicked_thumb) {
	  clicked_thumb.Remove();
	  clicked_thumb.AppendTo(
	    pather_.GetActiveStep().GetCollection());
	  clicked_thumb.HidePlus();
	});
    }
  }

  $.getJSON('/get_trip_data',
	    {
	      id: roadtrip_id
	    },
	    initialize);
}
