const request = require('request-promise');

var chat = {
    getUser: function(snapshot){
        return snapshot.key;
    },

    getMessage: function(obj){
        let elements = obj.toJSON();
        let messages = Object.keys(elements);
        let messageKey = messages[messages.length-1];
        return elements[messageKey]['message'];
    },
    
    sendMessage: function(message){
        return request({
            url: process.env.SLACKAPI,
            method: "POST",
            json: {"text": message}
        }).then(response => {
            console.log("sendToSlack: successfully");
        }).catch(error => {
            console.log("sendToSlack: " + error);
        });
    }
};
module.exports = chat;