/*jslint browser: true, white: true*/
/*global Pebble*/
var UI = require('ui'),
    main, i,
    data = window.localStorage.getItem('data') ? JSON.parse(window.localStorage.getItem('data')) : {events: []};

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
          values = data.events[e.itemIndex].values || [],
          props = "?", tmpCard;

      for (i = 0; i < values.length; i++) {
        props += values[i].name + '=' + encodeURIComponent(values[i].value) + "&";
      }

      console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
      console.log('payload:' + props);

      var req = new XMLHttpRequest();
      req.open('POST', 'https://maker.ifttt.com/trigger/' + encodeURIComponent(event) + '/with/key/' + data.key + props);

      req.onload = function(e) {
        console.log("Status: " + JSON.stringify(req));
        if (req.status == 200) {
          tmpCard = new UI.Card({
            title: name,
            body: "Success!"
          });
          tmpCard.show();
          setTimeout(function() {
            tmpCard.hide();
          }, 3000);
        }

        if (req.status != 200) {
          var message = "";
          if (req.status === 401) {
            message = "  Unauthorized.  Please check Secret Key.";
          }
          tmpCard = new UI.Card({
            title: name,
            body: "Failed!: " + req.status + message
          });
          tmpCard.show();
          setTimeout(function() {
            tmpCard.hide();
          }, 3000);
        }
      };

      req.send(null);
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
