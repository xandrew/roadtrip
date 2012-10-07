function Projector(roadtrip_id) {
  var div_ = $('#projector');
  var img_div_ = $('<div></div>');
  var input_ = $('<textarea rows=8 cols=100></textarea>');
  var image_id_;
  div_.append(img_div_);
  div_.append(input_);
  var descs_ = {};

  input_.change(function() {
		  if (image_id_ !== undefined) {
		    descs_[image_id_] = input_.val();
		  }
		});

  return {
    GetDescs: function() {
      var descs = [];
      $.each(descs_, function(key, value) {
	       if (value != '') {
		 descs.push({
			      image: key,
			      desc: value
			    });
	       }
	     });
      return descs;
    },
    SetDescs: function(descs) { 
      $.each(descs, function(idx, value) {
	       descs_[value.image] = value.desc;
	     });
    },
    ShowImage: function(image_id) {
      image_id_ = image_id;
      var full_url = '/static/' + roadtrip_id + '/' + image_id;
      var big_image_ = $(
	'<img class="projector_img" src="' + full_url + '"/>');
      img_div_.empty();
      img_div_.append(big_image_);
      img_div_.one('click', function() {
		     big_image_.remove();
		     div_.height(0);
		   });
      if (descs_[image_id_] !== undefined) {
	input_.val(descs_[image_id_]);
      } else {
	input_.val('');
      }
      div_.height('100%');
    }
  };
};

function Editor(roadtrip_id) {
  var map_ = new google.maps.Map(
    $("#map_canvas").get(0),
    {
      center: new google.maps.LatLng(-34.397, 150.644),
      zoom: 8,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

  var div_ = $('#editor_controlls');
  var projector_ = Projector(roadtrip_id);
  var remaining_collection_ = ThumbCollection(roadtrip_id, projector_);
  var trash_collection_ = ThumbCollection(roadtrip_id, projector_);
  var pather_ = Pather(map_, remaining_collection_, roadtrip_id, projector_);

  remaining_collection_.AddRemoveButtonTemplate(
    '-',
    function(image_id) {
      trash_collection_.AppendImage(image_id);
    });
  remaining_collection_.AddRemoveButtonTemplate(
    '+',
    function(image_id) {
      pather_.AddImageToActiveCollection(image_id);
    });

  trash_collection_.AddRemoveButtonTemplate(
    '^',
    function(image_id) {
      remaining_collection_.PrependImage(image_id);
    });
  
  function toJSON() {
    var result = {};
    result.trip_id = roadtrip_id;
    result.stages = [];
    var actual_step = pather_.GetFirstStep();
    while (actual_step !== undefined) {
      result.stages.push(actual_step.ToJSON());
      actual_step = actual_step.Next();
    }
    result.trashed_images = trash_collection_.GetImages();
    result.image_descs = projector_.GetDescs();
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
    div_.append($('<div>Trashed images</div>'));
    div_.append(trash_collection_.GetDiv());
    var remaining_images = trip_data.remaining_images;
    for (i = 0; i < remaining_images.length; i++) {
      remaining_collection_.AppendImage(remaining_images[i]);
    }
    var trashed_images = trip_data.trashed_images;
    for (i = 0; i < trashed_images.length; i++) {
      trash_collection_.AppendImage(trashed_images[i]);
    }
    if (trip_data.image_descs !== undefined) {
      projector_.SetDescs(trip_data.image_descs);
    }
  }

  $.getJSON('/get_trip_data',
	    {
	      id: roadtrip_id
	    },
	    initialize);
}
