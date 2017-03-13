
module.exports = (function(){

    var EventEmitter = require("events").EventEmitter,
        request = require("request"),
        idGenerator = require("node-snowflake").Snowflake,
        gConfig = require("../../../config.json"),
        route,
        controller,
        dbConn;

    var events = require("./events.json")

    var interfaces = new EventEmitter();

    serves = {}

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

        }

        var param = mission.param

        const serve = newServe(eventName, param)

        param.serveId = serve.serveId

        var newMission = {
            next: mission.source,
            param: param
        };

        controller.emit("logic", newMission);
    });

    function init( ...args ){
        var route;
        [controller, route, dbConn] = args;

        router = route.regist("conference");
        startWebService()
        router.mount();

        initServes();
    }

    // NOTICE: Rase possible
    function initServes() {
        dbConn.query("SELECT * FROM conference", {}, (err, results) => {
            if (err) {
                throw ("GG", err)
            }

            results.forEach(result => {
                serve = new Serve(result.event_name, result.serve_id, result.regist_list)
                serves[result.serve_id] = serve;
            })
        });
    }

    function initTelegram( registCommandHandler, registResultHandler ){
        registCommandHandler([
          {
            name: "conf",
            handler: ( args ) => {
              var options = {
                eventName: args[1]
              }
              return [args[0], options];
            }
          }
        ])
        
        registResultHandler([
            {
                name: "conf", 
                handler:(result) => {
                    let url = `${gConfig.serverEndPoint}/conference/${result.serveId}`
                    return {
                        type: "msg",
                        result: `您的專用 URL: ${url}`,
                    };
              }
            }
        ])
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
            req.serve.toggleEvent(req.body.agendaId)


            var serve = req.serve

            var content = getEvent(serve.eventName),
                registList = serve.registList;

        next()
      });

      router.all("/:id/", (req, res, next) => {

        var serve = req.serve

    function Serve(name, serveId, registList) {
        this.eventName = name;
        this.serveId = serveId;
        this.registList = registList;
    }

    Serve.prototype.toggleEvent = function(agendaId) {
        this.registList[agendaId] ^= 1;
        this.save();
    }

        res.render("conf/index", {content, config})
      })
    Serve.prototype.save = function() {
        dbConn.query(
            "REPLACE conference SET ?", {
                serve_id: this.serveId,
                event_name: this.eventName,
                regist_list: this.registList,
            },
            () => { console.log("[Conf] Saved. ", this.serve_id, this.registList) }
        )
    }

    function getEvent( eventName ){
    // NOTICE: Take care of 64+ buffer

        if( !events[eventName] ) {
          return false
    function newServe(eventName, param, buf) {

        while (true) {
            var serveId = idGenerator.nextId();
            if (!serves[serveId]) break;
        }

        return events[eventName]
        const serve = new Serve(eventName, serveId, buf || Buffer.alloc(64))
        serve.save()

        serves[serveId] = serve

        return serve
    }

    return {
        name: "conf",
        interfaces,
        init,
        initTelegram,
    }
})();
