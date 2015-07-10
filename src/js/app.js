/*jslint browser: true, white: true*/
/*global Pebble*/
var UI = require('ui'),
    main, i,
    tmpCard, lastCard,
    data = window.localStorage.getItem('data') ? JSON.parse(window.localStorage.getItem('data')) : {events: []};

var locationOptions = {
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
};


function setupMain() {
  if (main !== undefined) {
    main.hide();
  }

  if (data.key != undefined && data.events.length > 0) {
    var config = {
      sections: [{
        items: []
      }]
    };

    for (i = 0; i < data.events.length; i++) {
      config.sections[0].items.push({
        title: data.events[i].name
      });
    }

    main = new UI.Menu(config);

    main.on('select', function (e) {
      var name = data.events[e.itemIndex].name,
          event = data.events[e.itemIndex].event,
          values = data.events[e.itemIndex].values || [];

      console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);

      tmpCard = new UI.Card({
        title: 'Triggering',
        body: name
      });
      tmpCard.show();

      checkVariables(name, event, values, triggerEvent);
    });

    main.show();
  }
  else {
    main = new UI.Card({
      title: 'DoButton',
      icon: 'images/menu_icon.png',
      body: 'Please setup Maker Channel Information in Settings.'
    });

    main.show();
  }
}

function checkVariables(name, event, values, callback) {
  var needsLocation = false;

  function locationSuccess(pos) {
    console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude + " alt=" + pos.coords.altitude);
    console.log(JSON.stringify(pos));
    var dateTime = new Date(pos.timestamp);

    for (i = 0; i < values.length; i++) {
      values[i].calcValue = values[i].value.replace(/\{location\}/, pos.coords.latitude + ", " + pos.coords.longitude);
      values[i].calcValue = values[i].calcValue.replace(/\{location\.timestamp\}/, dateTime.toString());
      values[i].calcValue = values[i].calcValue.replace(/\{location\.latitude\}/, pos.coords.latitude);
      values[i].calcValue = values[i].calcValue.replace(/\{location\.longitude\}/, pos.coords.longitude);
      values[i].calcValue = values[i].calcValue.replace(/\{location\.altitude\}/, pos.coords.altitude);
      values[i].calcValue = values[i].calcValue.replace(/\{location\.speed\}/, pos.coords.speed || "unknown");
      values[i].calcValue = values[i].calcValue.replace(/\{location\.heading\}/, pos.coords.heading || "unknown");
    }

    fillPropVariables(name, event, values, callback);
  }

  function locationError(err) {
    console.log('location error (' + err.code + '): ' + err.message);
  }

  for (i = 0; i < values.length; i++) {
    needsLocation = needsLocation || values[i].value.match(/\{location\}/) !== null;
    needsLocation = needsLocation || values[i].value.match(/\{location\.timestamp\}/) !== null;
    needsLocation = needsLocation || values[i].value.match(/\{location\.latitude\}/) !== null;
    needsLocation = needsLocation || values[i].value.match(/\{location\.longitude\}/) !== null;
    needsLocation = needsLocation || values[i].value.match(/\{location\.altitude\}/) !== null;
    needsLocation = needsLocation || values[i].value.match(/\{location\.speed\}/) !== null;
    needsLocation = needsLocation || values[i].value.match(/\{location\.heading\}/) !== null;
  }

  if (needsLocation) {
    navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
  }
  else {
    fillPropVariables(name, event, values, callback);
  }
}

function fillPropVariables(name, event, values, callback) {
  var props = "?";

  for (i = 0; i < values.length; i++) {
    console.log(values[i].calcValue);
    props += values[i].name + '=' + encodeURIComponent(values[i].calcValue || values[i].value) + "&";
  }

  console.log('payload:' + props);

  callback(name, event, props);
}

function triggerEvent(name, event, props) {
  var req = new XMLHttpRequest();
  req.open('POST', 'https://maker.ifttt.com/trigger/' + encodeURIComponent(event) + '/with/key/' + data.key + props);

  req.onload = function(e) {
    console.log("Status: " + JSON.stringify(req));
    if (req.status == 200) {
      lastCard = tmpCard;
      tmpCard = new UI.Card({
        title: name,
        body: "Success!"
      });
      tmpCard.show();
      lastCard.hide();
      setTimeout(function() {
        tmpCard.hide();
      }, 3000);
    }

    if (req.status != 200) {
      var message = "";
      if (req.status === 401) {
        message = "  Unauthorized.  Please check Secret Key.";
      }

      lastCard = tmpCard;
      tmpCard = new UI.Card({
        title: name,
        body: "Failed!: " + req.status + message
      });
      tmpCard.show();
      lastCard.hide();
      setTimeout(function() {
        tmpCard.hide();
      }, 3000);
    }
  };

  req.send(null);
}

Pebble.addEventListener('showConfiguration', function () {
  console.log('show config');
  Pebble.openURL('http://garrinmf.github.io/DoButton/do_configuration_v2.html?data=' + encodeURIComponent(JSON.stringify(data)));
});

Pebble.addEventListener('webviewclosed', function (e) {
  data = JSON.parse(decodeURIComponent(e.response));
  console.log('Configuration window returned: ', JSON.stringify(data));
  window.localStorage.setItem('data', JSON.stringify(data));
  setupMain();
});

setupMain();
