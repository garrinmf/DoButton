$(function() {
  var newDiv = '<div id="event1" class="event">Name: <input type="text" name="name" /> &nbsp;&nbsp;Event: <input type="text" name="event" />&nbsp;<button class="remove">Remove</button></div>';

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

  var data = getURLVariable('data');
  if (data != "") {
    data = JSON.parse(data);
    $('input[name="secret_key"]').val(data.key);

    var events = $('#events');
    $.each(data.events, function(idx, event) {
      var newEvent = $(newDiv);
      newEvent.find('input[name="name"]').val(event.name);
      newEvent.find('input[name="event"]').val(event.event);
      events.prepend(newEvent);
    });
  }

  $('#submit').click(function() {
    var data = {
      key: "",
      events: []
    };

    data.key = $('input[name="secret_key"').val();

    $.each($('#events').children(), function(idx, child) {
      var name = $(child).find('input[name="name"]').val(),
        event = $(child).find('input[name="event"]').val();

      if (name !== undefined && name !== null && name !== "" && event !== undefined && event !== null && event !== "" ) {
        data.events.push({
          name: name,
          event, event
        })
      }
    });

    document.href = 'pebblejs://close#data=' + encodeURIComponent(JSON.stringify(data));
  });

  $('#cancel').click(function() {
    document.href = 'pebblejs://close';
  });

  $('.remove').click(RemoveHandler);


  $('#add_more').click(function() {
    var events = $('#events'),
      count = events.children().length;

    var htmlString = $(newDiv);

    htmlString.find('.remove').click(RemoveHandler);
    events.append(htmlString);
  });
});
