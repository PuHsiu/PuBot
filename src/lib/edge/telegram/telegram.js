
module.exports = (function(){

    // TODO: find a way to share port between multiple app.

    var telegram = require("./telegramBotAPI"),
        handlers = require("./commandHandler"),
        bodyParser = require('body-parser'),
        EventEmitter = require('events').EventEmitter,
        controller,
        missionQueue = [];

    function init( c ){
        controller = c;
        webhook();
    }

    function webhook(){

        var express = require('express');
        var app = new express();

        app.use(bodyParser.json());

        app.post("/telegram/webhook", function(req, res, next){

            var message = req.body.message;
            
            if( message.text ){

                let command = parseUserInput(message.text);

                if( command ){

                    if( handlers[command.type] ){

                        let mission = {};

                        mission.source = {
                            mId: missionQueue.push(mission),
                            module: "Telegram",
                            port: "botAPI"
                        };
                        mission.next = {
                            module: command.type,
                            port: "exec"
                        };
                        mission.param = handlers[command.type](command.args);
                    }
                }

                controller.emit( "logic", mission );
            }
            
            res.send("^_<");
            next();
        });

        app.listen( process.env.port || 30001, function( ...args ){
            console.log("Server Started.");    
        });
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
        telegram.sendMsg(mission.param.msg);   
    }); 
    
    return {
        "name": "Telegram",
        init,
        interfaces   
    };
})();
