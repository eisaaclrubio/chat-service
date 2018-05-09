const firebase = require('firebase');
const config = require('./src/config');
const chat = require('./src/chat');

firebase.initializeApp(config);

let db = firebase.database();
let ref = db.ref('messages/');
let message = '';

ref.on('child_added', function(snapshot){
    message = chat.getMessage(snapshot);
    chat.sendMessage(message);
})

ref.on('child_changed', function(snapshot){
    message = chat.getMessage(snapshot);
    chat.sendMessage(message);
});
