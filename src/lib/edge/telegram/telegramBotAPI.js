
module.exports = (function(){

    //TODO: one instance for one client.

    var request = require("request"),
        config = require("./config.json");

    var proto = {
        constructor: Telegram,
        sendMsg: function( msg ){
            if( !config.chat_id ){
                throw new Error("Unable to get chat_id. Please spec it in config.json with property: chat_id.");
            }
            return new Promise((resolve, reject)=>{
                request.post({url: this.botAPI+"sendMessage", form: {chat_id: config.chat_id, text: msg}}, (err, response, body)=>{
                    if( err ) reject(err);
                    resolve( {response, body} );
                })
            });
        }
    };

    function Telegram(){

        if( !config.token ){
            throw new Error("Unable to parse API token. Please spec it in config.json with property: token.");
        }

        var botAPI = "https://api.telegram.org/bot"+config.token+"/";

        return {
            __proto__: proto,
            botAPI
        }
    };

    return Telegram();
})();
