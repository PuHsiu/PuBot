
module.exports = (function(){

    // TODO: find a way to share port between multiple app.

    var handlers = require("./commandHandler"),
        Chat = require("./chat"),
        EventEmitter = require('events').EventEmitter,
        route,
        controller;

    function init( ...args ){
        [controller, route] = args;
        webhook();
    }

    function webhook(){

        router = route.regist("telegram")
        router.post("/webhook", function(req, res, next){

            var message = req.body.message;

            res.send("^_<");

            if( message.text ){

                let command = parseUserInput(message.text);

                if( command ){
                    
                    if( handlers[command.type] ){

                        let mission = {};

                        mission.source = {
                            module: "Telegram",
                            port: "botAPI"
                        };

                        mission.next = {
                            module: command.type
                        };

                        [ mission.next.port, mission.param ] = handlers[command.type](command.args);
                        mission.param.command = command.type;
                        mission.param.chat = Chat.createByMessage(message);

                        controller.emit( "logic", mission );
                    } else {
                        throw new Error(`Command ${command.type} is not supported.`);
                    }
                } else {
                    throw new Error( `Cannot Parse the command.` );
                }
            } else {
                throw new Error( "Unexcept Error Happened.");
            }

            next();
        });

        router.mount();
    }

    function parseUserInput( input ){

        var tokens, type;

        // Todo: Make "some string" as one token.
        if( input.startsWith("/") ){
            tokens = input.slice(1).split(/\s+/);
            type = tokens.shift();
        }

        return type ? { type, args: tokens } : false;
    }

    var interfaces = new EventEmitter();
    interfaces.on("botAPI", function(mission){
        Chat.send(mission.param.chat, mission.param);
    });

    return {
        "name": "Telegram",
        init,
        interfaces
    };
})();
