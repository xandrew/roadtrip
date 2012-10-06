function BreakDiv() {
  return $('<div style="clear:both"></div>');  
}

function ThumbCollection(roadtrip_id, projector_div) {
  var outer_div_ = $('<div></div>');
  var div_ = $('<div class="thumb_collection"></div>');
  outer_div_.append(div_);
  outer_div_.append(BreakDiv());
  var thumbs_ = [];

  function Thumb(image_id) {
    var div_ = $('<div class="thumb"></div>');
    var parent_;
    var thumb_url_ = '/static/' + roadtrip_id + '/thumb/' + image_id;
    var full_url_ = '/static/' + roadtrip_id + '/' + image_id;
    var image_ = $('<img class="thumb_img" src="' + thumb_url_ + '"></img>');
    div_.append(image_);
    var plus_button_ = $('<button>+</button>');
    var plus_handler_;
    var minus_button_ = $('<button>-</button>');
    var minus_handler_;

    function add_handlers_() {
      plus_button_.click(function() {
			   if (plus_handler_ !== undefined) {
			     plus_handler_(api_);
			   }
			 });
      minus_button_.click(function() {
			    if (minus_handler_ !== undefined) {
			      minus_handler_(api_);
			    }
			  });
      image_.click(
	function() {
	  var big_image = $('<img class="projector_img" src="' + full_url_ + '"/>');
	  projector_div.height('100%');
	  projector_div.empty();
	  projector_div.append(big_image);
	  projector_div.click(function() { big_image.remove(); projector_div.height(0); });
	});
    }

    var api_ = {
      AppendTo: function(collection) {
	collection.Append(api_);
	parent_ = collection;
	add_handlers_();
      },
      Remove: function() {
	if (parent_ !== undefined) {
	  parent_.Remove(api_);
	}
	parent_ = undefined;
      },
      ShowPlus: function(handler) {
	div_.append(plus_button_);
	plus_handler_ = handler;
      },
      HidePlus: function() {
	plus_button_.remove();
	plus_handler_ = undefined;
      },
      ShowMinus: function(handler) {
	div_.append(minus_button_);
	minus_handler_ = handler;
      },
      HideMinus: function() {
	minus_button_.remove();
	minus_handler_ = undefined;
      },
      GetDiv: function() {
	return div_;
      },
      GetImageId: function() {
	return image_id;
      }
    };

    return api_;
  }





  function indexOf(thumb) {
    for (var i = 0; i < thumbs_.length; i++) {
      if (thumb === thumbs_[i]) {
	return i;
      }
    }
    return undefined;
  }

  function removeThumb(thumb, idx) {
    thumb.GetDiv().remove();
    thumbs_.splice(idx, 1);
  }

  var api_ = {
    GetDiv: function() {
      return outer_div_;
    },
    Append: function(thumb) {
      if (indexOf(thumb) === undefined) {
	div_.append(thumb.GetDiv());
	thumbs_.push(thumb);
      }
    },
    Prepend: function(thumb) {
      if (indexOf(thumb) === undefined) {
	div_.prepend(thumb.GetDiv());
	thumbs_.splice(0, 0, thumb);
      }
    },
    Remove: function(thumb) {
      var idx = indexOf(thumb);
      if (idx !== undefined) {
	removeThumb(thumb, idx);
      }
    },
    PopLast: function() {
      if (thumbs_.length > 0) {
	var thumb = thumbs_[thumbs_.length - 1];
	removeThumb(thumb, thumbs_.length - 1);
	return thumb;
      }
      return undefined;
    },
    GetThumbs: function() { return thumbs_; },
    AddImage: function(image_id) {
      var thumb = Thumb(image_id);
      thumb.AppendTo(api_);
      thumb.ShowMinus(function(clicked_thumb) { clicked_thumb.Remove(); });
      return thumb;
    }
  };
  return api_;
}
