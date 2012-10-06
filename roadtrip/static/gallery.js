function Gallery(image_urls) {
  var div_ = $('<div class="gallery"></div>');
  var api_ = {};
  var current_ = 0;

  var prev_image_;
  var image_;
  var next_image_;

  function newImage(url, hidden, prepend) {
    var pane = $('<div class="image_pane"></div>');
    var image = $('<img src="' + url + '" class="bigimage"/>');
    pane.append(image);
    if (hidden) {
      pane.addClass('hidden');
    }
    if (prepend) {
      images_.prepend(pane);
    } else {
      images_.append(pane);
    }
    return pane;
  }

  var images_ = $('<div></div>');
  div_.append(images_);

  image_ = newImage(image_urls[0]);
  if (image_urls.length > 1) {
    next_image_ = newImage(image_urls[1], true);
  }

  var controlls_ = $('<div class="controlls"></div>'); 
  var left_nav_ = $('<div class="gallery_nav left hidden"><div class="arrow">&lt;</div></div>');
  var right_nav_ = $('<div class="gallery_nav right"><div class="arrow">&gt;</div></div>');
  controlls_.append(left_nav_);
  controlls_.append(right_nav_);
  div_.append(controlls_);

  function showHideArrows() {
    if (current_ > 0) {
      left_nav_.removeClass('hidden');
    } else {
      left_nav_.addClass('hidden');
    }

    if (current_ < image_urls.length - 1) {
      right_nav_.removeClass('hidden');
    } else {
      right_nav_.addClass('hidden');
    }
  };

  api_.getDiv = function() {
    return div_;
  };

  api_.goNext = function() {
    if (current_ >= image_urls.length - 1) {
      return;
    }
    if (prev_image_ !== undefined) {
      prev_image_.remove();
    }
    prev_image_ = image_;
    image_ = next_image_;
    image_.removeClass('hidden');
    current_++;
    if (current_ < image_urls.length - 1) {
      next_image_ = newImage(image_urls[current_ + 1], true);
    } else {
      next_image_ = undefined;
    }
    showHideArrows();
  };

  api_.goBack = function() {
    if (current_ == 0) {
      return;
    }
    if (next_image_ !== undefined) {
      next_image_.remove();
    }
    next_image_ = image_;
    image_ = prev_image_;
    next_image_.addClass('hidden');
    current_--;
    if (current_ > 0) {
      prev_image_ = newImage(image_urls[current_ - 1], false, true);
    } else {
      prev_image_ = undefined;
    }
    showHideArrows();
  };

  api_.install = function(parent) {
    parent.append(div_);
    right_nav_.click(api_.goNext);
    left_nav_.click(api_.goBack);
  };

  api_.remove = function() {
    div_.remove();
  };

  return api_;
}
