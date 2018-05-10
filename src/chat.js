const { WebClient } = require('@slack/client');

const token = process.env.SLACKTOKEN;
const web = new WebClient(token);

var chat = {
    getChannels: function(){
        return web.channels.list();
    },

    createChanel: function(channel){
        return web.channels.create({name: channel, validate:true});
    },

    getChannel: function(obj){
        let elements = obj.toJSON();
        let messages = Object.keys(elements);
        let messageKey = this.getPreviousMessagePath(messages);
        if(messageKey){
            return elements[messageKey]['channel'];
        }
        return null;
    },

    getDetails: function(snap, message, channel){
        let currentState = snap.val()[message.messagePath]
        currentState['channel'] = channel;
        return currentState;
    },

    getMessage: function(obj){
        let elements = obj.toJSON();
        let messages = Object.keys(elements);
        let messageKey = this.getMessagePath(messages);
        return {
            text: elements[messageKey]['message'],
            messagePath: messageKey
        };
    },

    getMessagePath: function(messages){
        return messages[messages.length-1];
    },

    getPreviousMessagePath: function(messages){
        if(messages.length>1) return messages[messages.length-2];
        return null;
    },

    getUser: function(obj){
        let elements = obj.toJSON();
        let messages = Object.keys(elements);
        let messageKey = this.getMessagePath(messages);
        return elements[messageKey]['user'];
    },

    getUserPath: function(snap){
        return snap.key;
    },

    sendMessage: function(channel, message, user){
        return web.chat.postMessage({
            channel: channel,
            username: user,
            text: message,
            icon_emoji: ':squirrel:'
        });
    },
};
module.exports = chat;
