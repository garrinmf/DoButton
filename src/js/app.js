var data = window.localStorage.getItem('data') ? JSON.parse(window.localStorage.getItem('data')) : {events: []};

Pebble.addEventListener('showConfiguration', function() {
  console.log('show config');
  Pebble.openURL('http://garrinmf.github.io/DoButton/do_configuration.html?data=' + encodeURIComponent(JSON.stringify(data)));
});

Pebble.addEventListener('webviewclosed', function(e) {
  data = JSON.parse(decodeURIComponent(e.response));
  console.log('Configuration window returned: ', JSON.stringify(data));
  window.localStorage.setItem('data', JSON.stringify(data))
  setupMain();
});

var UI = require('ui'),
  main;

setupMain();

function setupMain() {
  if (main !== undefined) {
    main.hide();
  }

  if(data.key != undefined && data.events.length > 0) {
    var config = {
      sections: [{
        items: []
      }]
    };

    for(var i = 0; i < data.events.length; i++){
      config.sections[0].items.push({
        title: data.events[i].name
      });
    }

    main = new UI.Menu(config);

    main.on('select', function(e) {
      var name = data.events[e.itemIndex].name,
          event = data.events[e.itemIndex].event;

      console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);

      var req = new XMLHttpRequest();
      req.open('GET', 'https://maker.ifttt.com/trigger/'+ event +'/with/key/' + data.key);
      req.onload = function(e) {
        console.log("Status: " + JSON.stringify(req));
        if (req.status == 200) {
          var tmpCard = new UI.Card({
            title: name,
            body: "Success!"
          });
          tmpCard.show();
          setTimeout(function() {
            tmpCard.hide();
          }, 3000);
        }

        if (req.status != 200) {
          var tmpCard = new UI.Card({
            title: name,
            body: "Failed!: " + req.status
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
