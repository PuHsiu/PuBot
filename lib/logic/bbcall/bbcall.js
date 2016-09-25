
module.exports = (function(){

    var EventEmitter = require("events").EventEmitter,
        idGenerator = require("node-snowflake").Snowflake,
        router,
        controller;

    var db = {}

    var interfaces = new EventEmitter();

    interfaces.on("regist", function( mission ){

        var id;

        if( mission.param.id && !db[mission.param.id]){
            id = mission.param.id
        } else {
            while(true) {
                var tryId = idGenerator.nextId();
                if( !db[tryId] ) break;
            }
            id = tryId
        }

        db[id] = {
            next: mission.source,
            chat: mission.param.chat
        };

        param = mission.param;
        param.id = id

        var newMission = {
            next: mission.source,
            param
        }

        controller.emit("logic", newMission);
    })

    function init( ...args ){
        var route;
        [controller, route] = args;

        router = route.regist("bbcall");

        startWebService();
        router.mount();
    }

    function startWebService(){

        router.get("/:id/", (req, res, next) => {
            var id = req.params.id;
            if(!db[id]){
                res.status(404).send("找不到這個人哦！");
            }
            res.render("bbcall/index", {id} )
        });

        router.post("/:id/", (req, res, next) => {

            var id = req.params.id;

            if(!db[id]){
                res.status(404).json({error: "Unknown Room."});
            }

            sender = req.body.sender;
            message = req.body.message;

            param = {};
            param.chat = db[id].chat;
            param.sender = sender;
            param.command = "bbcall_back";
            param.message = message;

            var newMission = {
                next: db[id].next,
                param
            }

            controller.emit("logic", newMission);

            var result = {
              status: 0
            }

            res.render("bbcall/index", {id, result});
        });

    }

    function initTelegram( registCommandHandler, registResultHandler ){
        registCommandHandler([
            {
                name: "bbcall",
                handler: ( args )=>{
                    var options = {
                        id: args[1]
                    }
                    return [args[0], options];
                }
            }
        ])
        registResultHandler([
            {
                name: "bbcall", 
                handler:(result) => {
                    return {
                        type: "msg",
                        result: `您的 ID 是: ${result.id}`
                    };
                }
            }, {
                name: "bbcall_back",
                handler: (result) => {
                    return {
                        type: "msg",
                        result: `收到來自 ${result.sender} 的訊息： ${result.message}`
                    };
                }
            },
        ])
    }

    return {
        name: "bbcall",
        interfaces,
        init,
        initTelegram,
    }
})();
