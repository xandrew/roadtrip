function BreakDiv() {
  return $('<div style="clear:both"></div>');  
}

function ThumbCollection(roadtrip_id, projector) {
  var outer_div_ = $('<div></div>');
  var div_ = $('<div class="thumb_collection"></div>');
  outer_div_.append(div_);
  outer_div_.append(BreakDiv());
  var thumbs_ = [];
  var remove_button_htmls_ = [];
  var remove_button_handlers_ = [];

  function Thumb(image_id) {
    var div_ = $('<div class="thumb"></div>');
    var button_pane_ = $('<div class="thumb_button_pane"></div>');
    var thumb_url_ = '/static/' + roadtrip_id + '/thumb/' + image_id;
    var image_ = $('<img class="thumb_img" src="' + thumb_url_ + '"></img>');
    div_.append(image_);
    div_.append(button_pane_);
    for (var i = 0; i < remove_button_htmls_.length; i++) {
      var button = $('<button class="thumb_button">' +
		     remove_button_htmls_[i] +
		     '</button>');
      button_pane_.append(button);
      function RegisterClick(current_i) {
	button.click(function() { buttonClick(api_, current_i); });
      };
      RegisterClick(i);
    }
    image_.click(
      function() { projector.ShowImage(image_id); });

    var api_ = {
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

  function buttonClick(thumb, button_idx) {
    var idx = indexOf(thumb);
    removeThumb(thumb, idx);
    remove_button_handlers_[button_idx](thumb.GetImageId());
  }

  var api_ = {
    GetDiv: function() {
      return outer_div_;
    },
    // Should be called before adding any image.
    AddRemoveButtonTemplate: function(html, handler) {
      remove_button_htmls_.push(html);
      remove_button_handlers_.push(handler);
    },
    AppendImage: function(image_id) {
      var thumb = Thumb(image_id);
      thumbs_.push(thumb);
      div_.append(thumb.GetDiv());
    },
    PrependImage: function(image_id) {
      var thumb = Thumb(image_id);
      thumbs_.splice(0, 0, thumb);
      div_.prepend(thumb.GetDiv());
    },
    PopLast: function() {
      if (thumbs_.length > 0) {
	var thumb = thumbs_[thumbs_.length - 1];
	removeThumb(thumb, thumbs_.length - 1);
	return thumb.GetImageId();
      }
      return undefined;
    },
    GetImages: function() {
      var images = [];
      $.each(thumbs_, function(idx, thumb) {
	       images.push(thumb.GetImageId());
	     });
      return images;
    }
  };
  return api_;
}
