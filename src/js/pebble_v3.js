$(function() {
  var newValue = '<div class="value"><div class="column">Name:Value<br /><input type="text" name="value_name" disabled/>:<input type="text" name="value_value" /></div></div>',
      newDiv = '<div id="event1" class="event table">' +
                '<div class="row"><div class="column">Name:</div><div class="column"><input type="text" name="name" /></div></div>' +
                '<div class="row"><div class="column">Event:</div><div class="column"><input type="text" name="event" /></div></div>' +
                '<h4>Event Properties</h4>' +
                '<div class="row values"></div>' +
                '<div class="row"><div class="column"><button class="add_values">+ Value</button></div><div class="column"></div></div>' +
                '</div><hr/>',
      newDataset = '<div class="dataset table">' +
                      '<div class="row"><div class="column">Name:</div><div class="column"><input type="text" name="dataset_name" ></div></div>' +
                      '<h4>DataSet Values</h4>' +
                      '<div class="row datasetvalues"></div>' +
                      '<div class="row"><div class="column"><button class="add_datasetvalues">+ Value</button></div><div class="column"></div></div>' +
                    '</div><hr />',
      newDatasetValue = '<div class="value"><div class="column">Name:Value<br /><input type="text" name="value_name" />:<input type="text" name="value_value" /></div></div>';

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

  function addDatasetValueHandler() {
    var $this = $(this),
        $values = $this.closest('.dataset').find('.datasetvalues');

    var $newValue = $(newDatasetValue);
    $values.append($newValue);
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
      events.append(newEvent);
    });

    var datasets = $('#datasets');

    $.each(data.datasets, function (idx, dataset) {
      var newDatasetDiv = $(newDataset);

      newDatasetDiv.find('input[name="dataset_name"]').val(dataset.name);

      $.each(dataset.values, function(idx, value) {
        var valueDiv = $(newDatasetValue);
        valueDiv.find('input[name="value_name"]').val(value.name);
        valueDiv.find('input[name="value_value"]').val(value.value);
        newDatasetDiv.find('.datasetvalues').append(valueDiv);
      });

      datasets.append(newDatasetDiv);
    });
  }

  $('#submit').tap(function() {
    var data = {
      key: "",
      events: [],
      datasets: []
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

    $.each($('#datasets').children(), function(idx, dataset) {
      var name = $(dataset).find('input[name="dataset_name"]').val(),
          valueDivs = $(dataset).find('.datasetvalues').children(),
          values = [];

      if (name === undefined || name === "") {
        return;
      }

      $.each(valueDivs, function (idx, value) {
        var valueName = $(value).find("input[name='value_name']").val(),
            valueValue = $(value).find("input[name='value_value']").val();

        if (valueValue !== undefined && valueValue !== "" ) {
          values.push({
            name: valueName,
            value: valueValue
          });
        }
      });

      if (name === undefined || name === "" || values.length <= 0) {
        return;
      }

      data.datasets.push({
        name: name,
        values: values
      });
    });

    location.href = 'pebblejs://close#' + encodeURIComponent(JSON.stringify(data));
  });

  $('#cancel').tap(function() {
    location.href = 'pebblejs://close';
  });

  $('.add_values').tap(addValueHandler);
  $('.add_datasetvalues').tap(addDatasetValueHandler);
  $('.remove').tap(RemoveHandler);

  $('#add_more').tap(function() {
    var events = $('#events'),
      count = events.children().length;

    var htmlString = $(newDiv);

    htmlString.find('.remove').tap(RemoveHandler);
    htmlString.find('.add_values').tap(addValueHandler);

    events.append(htmlString);
  });

  $('#add_dataset').tap(function () {
    var newSet = $(newDataset);

    newSet.find('.add_datasetvalues').tap(addDatasetValueHandler);

    $('#datasets').append(newSet);
  });
});
