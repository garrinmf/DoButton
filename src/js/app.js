var data = window.localStorage.getItem('data') ? JSON.parse(window.localStorage.getItem('data')) : {events: []};

Pebble.addEventListener('showConfiguration', function() {
  console.log('show config');
  Pebble.openURL('http://garrinmf.github.io/DoButton/do_configuration.html?data=' + encodeURIComponent(JSON.stringify(data)));
});

Pebble.addEventListener('webviewclosed', function(e) {
  console.log('close config');
  if (e.response) {
    var options = JSON.parse(decodeURIComponent(e.response));
    data = options.data;
    window.localStorage.setItem('data', data);
    data = JSON.parse(data);
  }
});

var UI = require('ui'),
  main;

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
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
    var req = new XMLHttpRequest();
    req.open('GET', 'https://maker.ifttt.com/trigger/'+data.events[e.itemIndex].event+'/with/key/' + key);
    req.onload = function(e) {
      console.log("Status: " + req.status);
    };

    req.send(null);
  });

  main.show();
}
else {
  main = new UI.Card({
    title: 'Pebble.js',
    icon: 'images/menu_icon.png',
    subtitle: 'Hello World!',
    body: 'Press any button.'
  });

  main.show();
}
