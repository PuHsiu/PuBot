
module.exports = (function(){

    var EventEmitter = require("events").EventEmitter,
        route,
        controller;

    var interfaces = new EventEmitter();

    interfaces.on("echo", function( mission ){

        var newMission = {
            next: mission.source,
            param: mission.param
        }

        controller.emit("logic", newMission);
    })

    function init( ...args ){
        [controller, route] = args;
    }

    function initTelegram( registCommandHandler, registResultHandler ){
        registCommandHandler([
            {
                name: "echo",
                handler: ( args )=>{
                    var options = {
                        msg: args.join(" ")
                    }
                    return [ "echo", options ];
                }
            }
        ])
        registResultHandler([
            {
                name: "echo", 
                handler:(result) => {
                    return {
                        type: "msg",
                        result: result.msg
                    };
                }
            }
        ])
    }

    return {
        name: "echo",
        interfaces,
        init,
        initTelegram,
    }
})();
