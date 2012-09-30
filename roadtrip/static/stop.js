function BreakDiv() {
  return $('<div style="clear:both"></div>');  
}

function Stop(set_active_callback) {
  var div_ = $('<div></div>');

  var active_button_ = $('<button>Fill This With Images</button>');
  active_button_.hide();
  var active_div_ = $('<div>Selected Images Come Here</div>');

  var collection_ = ThumbCollection();
  div_.append($('<div>StopStopStop!!!</div>'));
  div_.append(active_button_);
  div_.append(active_div_);
  div_.append(collection_.GetDiv());
  div_.append(BreakDiv());

  var api_ = {
    GetDiv: function() { return div_; },
    GetCollection: function() { return collection_; },
    DeActivate: function() {
      active_button_.show();
      active_div_.hide();
    },
    Activate: function() {
      active_button_.hide();
      active_div_.show();
      set_active_callback(api_);
    }
  };

  api_.Activate();

  active_button_.click(api_.Activate);
  return api_;
}
