const firebase = require('firebase');
const config = require('./config.js');
const request = require('request-promise');

firebase.initializeApp(config);

let db = firebase.database();
let ref = db.ref('messages/');
let original = {dummy: ''};
let messages = [];
let updated = {};
let newMessages = [];

function getLastMessage(user){
    let masterKey;
    updated[user].forEach( key => {
        if(!(key in original)){
            masterKey = key;
        }
    });
    let mess = ref.child(user + '/' + masterKey);
    mess.once('value').then( (snapshot) => {
        let something = snapshot.toJSON();
        sendMessage(something['message']);
    });
}

ref.on( 'value', function(snapshot){
    if(original === {dummy: ''}){
        original = snapshot.toJSON();
        let user = Object.keys(original);
        messages = Object.keys(original[user]);
        original[user] = messages;
    } else {
        updated = snapshot.toJSON();
        let user = Object.keys(updated);
        newMessages = Object.keys(updated[user]);
        updated[user] = newMessages;
        getLastMessage(user);
    }
});

function sendMessage(message) {
    return request({
        url: process.env.SLACKAPI,
        method: "POST",
        json: {"text": message}
    }).then(response => {
        console.log ("sendToSlack: successfully" );
    }).catch(error => {
        console.log ("sendToSlack: " + error);
    });
}
