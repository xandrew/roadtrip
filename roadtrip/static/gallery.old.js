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
