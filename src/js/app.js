/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');

var main = new UI.Card({
  title: 'Pebble.js',
  icon: 'images/menu_icon.png',
  subtitle: 'Hello World!',
  body: 'Press any button.'
});

main.show();

main.on('click', 'up', function(e) {
  var menu = new UI.Menu({
    sections: [{
      items: [{
        title: 'Start Recording',
        subtitle: ''
      }, {
        title: 'Stop Recording',
        subtitle: ''
      }]
    }]
  });
  menu.on('select', function(e) {
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
    var req = new XMLHttpRequest();
    if (e.itemIndex == 0) {
      req.open('GET', 'https://maker.ifttt.com/trigger/start_recording/with/key/chtZmV4cmmDvcpYOJQmh4Z');
    }
    else {
      req.open('GET', 'https://maker.ifttt.com/trigger/stop_recording/with/key/chtZmV4cmmDvcpYOJQmh4Z');
    }
    req.onload = function(e) {
      console.log("Status: " + req.status);
    };
    req.send(null);
  });
  menu.show();
});

main.on('click', 'select', function(e) {
  var wind = new UI.Window({
    fullscreen: true,
  });
  var textfield = new UI.Text({
    position: new Vector2(0, 65),
    size: new Vector2(144, 30),
    font: 'gothic-24-bold',
    text: 'Text Anywhere!',
    textAlign: 'center'
  });
  wind.add(textfield);
  wind.show();
});

main.on('click', 'down', function(e) {
  var card = new UI.Card();
  card.title('A Card');
  card.subtitle('Is a Window');
  card.body('The simplest window type in Pebble.js.');
  card.show();
});
