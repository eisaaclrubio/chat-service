const firebase = require('firebase');
const { RTMClient } = require('@slack/client');
const config = require('./src/config');
const chat = require('./src/chat');

const token = process.env.SLACKTOKEN;
const rtm = new RTMClient(token);
firebase.initializeApp(config);
rtm.start();

let db = firebase.database();
let ref = db.ref('messages/');
let details = {};
let channel = '';
let userPath = '';
let messagePath = '';
let message = '';
let user = '';
let visitor = 1;
let users = {}

rtm.on('message', (event) => {
    const timestamp = getTimeStamp();
    let chnl = '';
    chat.getChannels().then( list => {
        list.channels.forEach( c => {
            chnl = event.channel == c.id ? c.name : chnl;
        });
        if(!event.user_profile && event.user == 'U9CGVQLGP' && users[chnl]){
            let answer = {
                message: event.text,
                isLast: false,
                timeSent: timestamp,
                user: 'Isaac',
                email: 'my@email.com',
                channel: chnl
            }
            ref.child(users[chnl]).push(answer);
        }
    }); 
});

ref.on('child_added', function(snapshot){
    channel = `visitor-${visitor}`;
    userPath = chat.getUserPath(snapshot);
    message = chat.getMessage(snapshot);
    user = chat.getUser(snapshot);
    details = chat.getDetails(snapshot, message, channel);
    chat.createChanel(channel).then(() => {
        users[channel] = userPath;
        chat.sendMessage(channel, message.text, user);
        ref.child(`${userPath}/${message.messagePath}`).update(details);
        visitor++;
    }).catch((err) => {
        channel = chat.getChannel(snapshot);
        users[channel] = userPath;
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
    console.log(user, channel);
    if(!snapshot.val()[message.messagePath]['channel'] && channel && user != 'Isaac'){
        details = chat.getDetails(snapshot, message, channel);
        chat.sendMessage(channel, message.text, user).then(() => {
            users[channel] = userPath;
            ref.child(`${userPath}/${message.messagePath}`).update(details);
        }).catch((err) => {
            chat.createChanel(channel).then(() => {
                users[channel] = userPath;
                chat.sendMessage(channel, message.text, user);
            });
        });
    }
});

function getTimeStamp() {
    const now = new Date();
    const date = now.getUTCFullYear() + '/' +
                 (now.getUTCMonth() + 1) + '/' +
                 now.getUTCDay();
    const time = now.getUTCHours() + ':' +
                 now.getUTCMinutes() + ':' +
                 now.getUTCSeconds();
    return (date + ' ' + time);
};
