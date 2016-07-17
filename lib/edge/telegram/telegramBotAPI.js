
module.exports = (function(){

    //TODO: one instance for one client.

    var request = require("request"),
        config = require("./config.json");

    var resultHandler = {
        echo: (result) => {
            return {
                type: "msg",
                result: result.msg
            };
        },
        kktix: (result) => {
            var command = result.kkCommand;
            return {
                type: "msg",
                result:  (result.tickets.allClosed ? "目前所有票種均已售畢 (╥﹏╥)\n" : "") + result.tickets.map((e, i)=>{
                    return `[${i}] ${e.ticketType} ${e.closed ? "(售畢)" : ""}`;
                }).join("\n")
            };
        }
    };

    function Telegram(){

        if( !config.token ){
            throw new Error("Unable to parse API token. Please spec it in config.json with property: token.");
        }

        this.botAPI = "https://api.telegram.org/bot"+config.token+"/";
    };

    Telegram.prototype.send = function( chatId, message ) {
        var command = message.command,
            { type, result } = resultHandler[command](message);

        if( "msg" === type ){
            return this.sendMessage( chatId, result );
        } else {
            throw new Error("Unexception Error.");
        }

    };
    
    Telegram.prototype.sendMessage = function( chatId, message ){
        console.log(this.botAPI+"sendMessage");
        console.log(chatId);
        console.log(message);
        return new Promise((resolve, reject)=>{
            request.post({
                url: this.botAPI+"sendMessage",
                form: {
                    chat_id: chatId,
                    text: message
                }
            }, (err, response, body)=>{
                if( err ) reject(err);
                resolve( {response, body} );
            })
        });
    };

    return new Telegram();
})();
