
module.exports = (function(){

    //TODO: one instance for one client.

    var request = require("request"),
        config = require("./config.json");

    var resultHandler = {
        echo: (result) => {
            return result.msg;
        },
        kktix: (result) => {
            var command = result.kkCommand;
            return result.tickets.map((e)=>{
                return `${e.ticketType} ${e.closed ? "(售畢)" : ""}`;
            }).join("\n");
        }
    };

    var proto = {
        constructor: Telegram,
        sendMsg: function( msg ){
            if( !config.chat_id ){
                throw new Error("Unable to get chat_id. Please spec it in config.json with property: chat_id.");
            }
            return new Promise((resolve, reject)=>{
                request.post({
                    url: this.botAPI+"sendMessage",
                    form: {
                        chat_id: config.chat_id,
                        text: resultHandler[command](result)
                    }
                }, (err, response, body)=>{
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
