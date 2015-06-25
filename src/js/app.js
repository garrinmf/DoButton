/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');

var main = new UI.Menu({
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

main.on('select', function(e) {
  console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
  console.log('The item is titled "' + e.item.title + '"');
  var req = new XMLHttpRequest();
  req.open('GET', 'https://maker.ifttt.com/trigger/'+action[e.itemIndex].event+'/with/key/' + secret_key);
  req.onload = function(e) {
    console.log("Status: " + req.status);
  };

  req.send(null);
});

main.show();
