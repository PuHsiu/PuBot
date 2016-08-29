
module.exports = (function(){

    var EventEmitter = require("events").EventEmitter,
        request = require("request"),
        idGenerator = require("node-snowflake").Snowflake,
        route,
        controller;

    var events = require("./events.json")

    var interfaces = new EventEmitter();

    serves = {}

    serves.debug = {
        eventName: "MSCOC-201608",
        param: {},
        config: {
          registList: []
        }
    }

    interfaces.on("regist", ( mission )=>{

        if (!mission.param.eventName) {

            controller.emit("error", {
                param: {
                    source: mission.source,
                    msg: "Please setup option \"event\""
                }
            });

            return;
        }

        var eventName = mission.param.eventName
        var content = getEvent(eventName)

        if ( !content ){

          controller.emit("error", {
            param: {
              source: mission.source,
              msg: "Unable to get event content."
            }
          })

          return;
        }

        while (true){
          var serveId = idGenerator.nextId();
          if( !serves[serveId] ) break;
        }

        var param = mission.param
        param.serveId = serveId

        serves[serveId] = {
          eventName,
          param,
          config: {
            registList: []
          }
        }

        var newMission = {
            next: mission.source,
            param: param
        };

        controller.emit("logic", newMission);
    });

    function init( ...args ){
        var route;
        [controller, route] = args;

        router = route.regist("conference");
        startWebService()
        router.mount();
    }

    function startWebService(){

      router.all("/:id/", (req, res, next) => {

        var serveId = req.params.id;
        if( !serves[serveId] ){
          res.status(404).json({error: "Unknown Room"});
        }

        req.serve = serves[serveId]
        next()
      })

      router.get("/:id/", (req, res, next) => {
        // Do nothing
        next()
      });

      router.post("/:id/", (req, res, next) => {

        var serve = req.serve;

        var handler = {};

        var registList = serve.config.registList,
            agendaId = req.body.agendaId

        if(!~registList.indexOf(agendaId)){
          registList.push(agendaId)
        } else {
          registList.splice(registList.indexOf(agendaId), 1)
        }

        next()
      });

      router.all("/:id/", (req, res, next) => {

        var serve = req.serve

        var content = getEvent(serve.eventName),
            config = serve.config;

        res.render("conf/index", {content, config})
      })
    }

    function getEvent( eventName ){

        if( !events[eventName] ) {
          return false
        }

        return events[eventName]
    }

    return {
        name: "conf",
        interfaces,
        init
    }
})();
