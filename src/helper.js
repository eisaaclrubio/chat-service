const request = require('request-promise');

var helper = {
    getKeys: function(obj){
        return Object.keys(obj);
    },
    
    isEmpty: function(obj){
        return Object.keys(obj).length === 0;
    },
    
    sendMessage: function(message) {
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
}
module.exports = helper;