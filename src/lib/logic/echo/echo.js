
module.exports = (function(){

    var EventEmitter = require("events").EventEmitter,
        controller;

    var interfaces = new EventEmitter();

    interfaces.on("exec", function( mission ){

        var newMission = {
            next: mission.source,
            param: {
                msg: mission.param.msg
            }
        }

        controller.emit("logic", newMission);
    })

    function init( c ){
        controller = c;
    }

    return {
        name: "echo",
        interfaces,
        init
    }
})();
