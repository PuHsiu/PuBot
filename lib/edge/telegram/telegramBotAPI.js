
module.exports = (function(){

    //TODO: one instance for one client.

    var request = require("request"),
        fs = require("fs")
        config = require("./config.json");

    var resultHandler = {}
    var registResultHandler = ( handlers ) => {
        handlers.forEach((handler)=>{
            resultHandler[handler.name] = handler.handler
            console.log("Init Result Handler....", handler.name)
        })
    }

    new Promise((resolve, reject) => {
        fs.readdir("./lib/logic/", (err, files)=>{
            if(err) reject(err);
            else resolve(files);
        });
    }).then(( files )=>{
        files.forEach((file)=>{
            var module = require( "../../logic/"+file );
            console.log("Loading Module From.....", file)
            module.initTelegram && module.initTelegram(()=>{}, registResultHandler);
        });
    });

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
