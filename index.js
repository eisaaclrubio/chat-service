const firebase = require('firebase');
const config = require('./src/config');
const chat = require('./src/chat');

firebase.initializeApp(config);

let db = firebase.database();
let ref = db.ref('messages/');
let details = {};
let userPath = '';
let messagePath = '';
let message = '';
let user = '';
let visitor = 1;

ref.on('child_added', function(snapshot){
    channel = `visitor-${visitor}`;
    userPath = chat.getUserPath(snapshot);
    message = chat.getMessage(snapshot);
    user = chat.getUser(snapshot);
    details = chat.getDetails(snapshot, message, channel);
    chat.createChanel(channel).then(() => {
        chat.sendMessage(channel, message.text, user);
        ref.child(`${userPath}/${message.messagePath}`).update(details);
        visitor++;
    }).catch((err) => {
        channel = chat.getChannel(snapshot);
        chat.sendMessage(channel, message.text, user);
        ref.child(`${userPath}/${message.messagePath}`).update(details);
    });
    }, function (errorObject) {
    console.log("Initialzed Chat - there are no stored chats");
});

ref.on('child_changed', function(snapshot){
    userPath = chat.getUserPath(snapshot);
    message = chat.getMessage(snapshot);
    user = chat.getUser(snapshot);
    channel = chat.getChannel(snapshot);
    if(!snapshot.val()[message.messagePath]['channel'] && channel){
        details = chat.getDetails(snapshot, message, channel);
        chat.sendMessage(channel, message.text, user).catch((err) => {
            chat.createChanel(channel).then(() => {
                chat.sendMessage(channel, message.text, user);
            });
        });
        ref.child(`${userPath}/${message.messagePath}`).update(details);
    }
});
