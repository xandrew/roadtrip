function Thumb(projector_div, thumb_url, full_url) {
  var div_ = $('<div class="thumb"></div>');
  var parent_;
  var image_ = $('<img class="thumb_img" src="' + thumb_url + '"></img>');
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
	var url = full_url;
	if (url === undefined) {
	  url = thumb_url;
	}
	var big_image = $('<img class="projector_img" src="' + url + '"/>');
	projector_div.height('100%');
	projector_div.empty();
	projector_div.append(big_image);
	projector_div.click(function() { big_image.remove(); projector_div.height(0); });
      });
  }

  var api_ = {
    'AppendTo': function(collection) {
      collection.GetCollecterDiv().append(div_);
      parent_ = collection;
      add_handlers_();
    },
    'Remove': function() {
      div_.remove();
      parent_ = undefined;
    },
    'ShowPlus': function(handler) {
      div_.append(plus_button_);
      plus_handler_ = handler;
    },
    'HidePlus': function() {
      plus_button_.remove();
      plus_handler_ = undefined;
    },
    'ShowMinus': function(handler) {
      div_.append(minus_button_);
      minus_handler_ = handler;
    },
    'HideMinus': function() {
      minus_button_.remove();
      minus_handler_ = undefined;
    }
  };


  return api_;
}

function ThumbCollection() {
  var div_ = $('<div class="thumb_collection"></div>');

  return {
    'GetDiv': function() {
      return div_;
    },
    'GetCollecterDiv': function() {
      return div_;
    }
  };
}
