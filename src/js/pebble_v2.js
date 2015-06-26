$(function() {
  var newValue = '<div class="value"><div class="column">Name:Value<br /><input type="text" name="value_name" disabled/>:<input type="text" name="value_value" /></div></div>';
  var newDiv = '<div id="event1" class="event table">' +
                '<div class="row"><div class="column">Name:</div><div class="column"><input type="text" name="name" /></div></div>' +
                '<div class="row"><div class="column">Event:</div><div class="column"><input type="text" name="event" /></div></div>' +
                '<h4>Event Properties</h4>' +
                '<div class="row values"></div>' +
                '<div class="row"><div class="column"><button class="add_values">+ Value</button></div><div class="column"></div></div>' +
                '</div><hr/>';

  function getURLVariable(name)  {
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)",
      regex = new RegExp(regexS),
      results = regex.exec(window.location.href);
    if (results == null) return "";
    else return decodeURIComponent(results[1]);
  }

  function RemoveHandler() {
    $(this).parent().remove();
  }

  function addValueHandler() {
    var $this = $(this),
        $values = $this.closest('.event').find('.values');
    if ($values.children().length < 3) {
      var $newValue = $(newValue);
      $newValue.find('input[name="value_name"]').val('value' + ($values.children().length + 1));
      $values.append($newValue);
    }
  }

  var data = getURLVariable('data');
  if (data != "") {
    data = JSON.parse(data);
    $('input[name="secret_key"]').val(data.key);

    var events = $('#events');
    $.each(data.events, function(idx, event) {
      var newEvent = $(newDiv);
      newEvent.find('input[name="name"]').val(event.name);
      newEvent.find('input[name="event"]').val(event.event);

      event.values = event.values || [];

      $.each(event.values, function(idx, value) {
        var event = $(newValue);
        event.find('input[name="value_name"]').val(value.name);
        event.find('input[name="value_value"]').val(value.value);
        newEvent.find('.values').append(event);
      })
      events.prepend(newEvent);
    });
  }

  $('#submit').tap(function() {
    var data = {
      key: "",
      events: []
    };

    data.key = $('input[name="secret_key"]').val();

    $.each($('#events').children(), function(idx, child) {
      var name = $(child).find('input[name="name"]').val(),
        event = $(child).find('input[name="event"]').val();

      if (name !== undefined && name !== "" && event !== undefined && event !== "" ) {
        var event = {
          name: name,
          event: event,
          values: []
        };
        var values = $(child).find('.values').children();
        $.each(values, function(idx, value) {
          var valueName = $(value).find('input[name="value_name"]').val(),
              valueValue = $(value).find('input[name="value_value"]').val();
          if (valueName !== undefined && valueName !== "" &&  valueValue !== undefined && valueValue !== "" ) {
            event.values.push({
              name: valueName,
              value: valueValue
            });
          }
        });
        data.events.push(event);
      }
    });

    location.href = 'pebblejs://close#' + encodeURIComponent(JSON.stringify(data));
  });

  $('#cancel').tap(function() {
    location.href = 'pebblejs://close';
  });

  $('.add_values').tap(addValueHandler);
  $('.remove').tap(RemoveHandler);

  $('#add_more').tap(function() {
    var events = $('#events'),
      count = events.children().length;

    var htmlString = $(newDiv);

    htmlString.find('.remove').tap(RemoveHandler);
    htmlString.find('.add_values').tap(addValueHandler);

    events.append(htmlString);
  });
});
