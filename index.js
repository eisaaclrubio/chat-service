const firebase = require('firebase');
const config = require('./config');
const ob = require('./src/helper');

firebase.initializeApp(config);

let db = firebase.database();
let ref = db.ref('messages/');
let initialized = false;
let before = {};
let messages = [];
let users = [];

ref.once('value').then( (snapshot) => {
    let snap = snapshot.toJSON();
    users = ob.getKeys(snap);
    users.forEach( user => {
        messages = ob.getKeys(snap[user]);
        before[user] = messages;
    });
    initialized = true;
}).catch( error => {
    console.log('The database is empty');
});

ref.on( 'value', function(snapshot){
    if(initialized){
        let after = snapshot.toJSON();
        let newUsers = ob.getKeys( after);
        getAsyncRef(after, newUsers).then( reference => {
            sendMessage(reference);
            users = newUsers;
        });
    }
});

function sendMessage(child){
    child.once('value').then( (snapshot) => {
        let snap = snapshot.toJSON();
        ob.sendMessage(snap['message']);
    });
};

function notAsyncRef(after, newUsers){
    newUsers.forEach( user => {
        if(!users.includes(user)){
            messages = ob.getKeys(after[user]);
            let message = messages[messages.length - 1];
            before[user] = messages;
            messageRef = ref.child(user + '/' + message);
        } else {
            let userMessages = ob.getKeys(after[user]);
            userMessages.forEach(message => {
                if(!before[user].includes(message)) {
                    messageRef = ref.child(user + '/' + message);
                }
            });
            before[user] = userMessages;
        }
    });
    return messageRef;
}

function getAsyncRef(after, newUsers){
    return new Promise((resolve, reject) => {
        let messageRef = notAsyncRef(after, newUsers);
        if(messageRef){
            resolve(messageRef);
        } else {
            reject('Error');
        }
    });
};
