
module.exports = (function(){

    var EventEmitter = require("events").EventEmitter,
        request = require("request"),
        cheerio = require("cheerio"),
        idGenerator = require("node-snowflake").Snowflake,
        tool = require("../../tool/input_parser"),
        route,
        controller;

    var interfaces = new EventEmitter();

    function getTicketQuota( organization, events, ticketTypes ){

        var eventPageURL = [
            "http://",
            organization, ".kktix.cc/",
            "events/", events].join("");

        return new Promise((resolve, reject)=>{
            request({
                url: eventPageURL,
                method: "GET"
            }, function (e, r, b) {
                if (e) reject(e);else resolve(b);
            });
        }).then(function (html) {

            var htmlParser = cheerio.load(html);
            var $ticketInfo = htmlParser("div.tickets tbody tr");

            var result = $ticketInfo.map((i, $e)=>{

                var $tr = htmlParser($e);

                var [ticketType, closed, periodTime, price] = [
                    $tr.find("td.name").get(0).children[0].data,
                    !!$tr.find("span.closed").length,
                    ((e)=>{
                        return {
                            start: e.get(0).children[0].data,
                            end: e.get(1).children[0].data
                        };
                    })($tr.find("span.timezoneSuffix")),
                    ((e)=>{
                        var child = e.get(0).children;
                        return child[0].type === 'text' ?
                            child[0].data :
                            child.reduce((p, c)=>{return p+c.children[0].data}, "")
                    })($tr.find("span.price"))
                ];

                return {
                    ticketType,
                    closed,
                    periodTime,
                    price
                };
            });

            result = [].slice.call(result);

            var allClosed = !!htmlParser(".btn-no-tickets").length
            result.allClosed = allClosed


            return Promise.resolve(result);
        });
    }

    var notifyList = []

    interfaces.on("notify", ( mission )=>{

        if (!mission.param.organization || !mission.param.event) {
            controller.emit("error", {
                param: {
                    source: mission.source,
                    msg: "Please setup option \"organization\" and \"event\""
                }
            });

            return;
        }

        var delay = mission.param.delay * 1000 || 3600 * 1000;
        var id = idGenerator.nextId();

        function loop(){
          getTicketQuota(mission.param.organization, mission.param.event).then(function (tickets) {
              var param = mission.param;
              param.tickets = tickets;
              param.timerId = id;

              var newMission = {
                  next: mission.source,
                  param: param
              };

              controller.emit("logic", newMission);
          });
        };

        loop();
        var timerObject = setInterval(loop, delay);

        notifyList.push({
          id,
          timerObject
        });
    });

    interfaces.on("stop_notify", (mission)=>{
        var timerObjectList = notifyList.filter((e)=>{
          return e.id === mission.param.timerId
        });

        var param = mission.param;

        var newMission = {
            next: mission.source,
            param
        }

        if( timerObjectList.length ){
          clearInterval(timerObjectList[0].timerObject)
          param.result = true
        } else {
          param.result = false
        }

        controller.emit("logic", newMission);
    });

    interfaces.on("check", ( mission )=>{

        if( !mission.param.organization || !mission.param.event ){
            controller.emit("error", {
                param: {
                    source: mission.source,
                    msg: "Please setup option \"organization\" and \"event\""
                }
            });

            return;
        }

        getTicketQuota(
            mission.param.organization,
            mission.param.event
        ).then((tickets)=>{

            var param = mission.param;
            param.tickets = tickets;

            var newMission = {
                next: mission.source,
                param
            }

            controller.emit("logic", newMission);
        });
    });

    interfaces.on("list", function( mission ){

    });

    function init( ...args ){
        [controller, route] = args;
    }

    function initTelegram(registCommandHandler, registResultHandler){
        registCommandHandler([
            {
                name: "kktix",
                handler: ( args )=>{

                    var options = {};

                    var optionsDecorator = {
                        "organization": (args)=>{
                            options.organization = args[0];
                        },
                        "event": (args)=>{
                            options.event = args[0];
                        },
                        "delay": (args)=>{
                            options.delay = args[0];
                        },
                        "ticket": (args)=>{
                            options.tickets = args;
                        },
                        "id": (args)=>{
                            options.timerId = args[0];
                        },
                    };

                    var commandMapping = {
                        "check": "check",
                        "notify": "notify",
                        "stop_notify": "stop_notify",
                    }

                    if( !commandMapping[args[0]] ){
                        throw new Error(`Command ${args[0]} is not supported.`);
                    }

                    var command = commandMapping[args.shift()];

                    var commandOptions = tool.parseCommandOption(args);

                    Object.keys(commandOptions).forEach((commandOptionType)=>{
                        if( !optionsDecorator[commandOptionType] )
                            throw new Error(`Option ${commandOptionType} is not supported`);

                        optionsDecorator[commandOptionType](commandOptions[commandOptionType]);
                    });

                    options.kkCommand = command;

                    return [command, options];
                }
            }
        ])
        
        registResultHandler([
            {
                name: "kktix", 
                handler:(result) => {
                    var command = result.kkCommand;
                    var returnStr;

                    var eventUrl = "http://{{organization}}.kktix.cc/events/{{event}}".replace("{{organization}}", result.organization).replace("{{event}}", result.event)

                    commandHandlers = {
                        notify: function(){
                        return (result.tickets.allClosed ? "目前所有票種均已售畢 (╥﹏╥)\n" : "") + result.tickets.map((e, i)=>{
                            return `[${i}] ${e.ticketType} ${e.closed ? "(售畢)" : ""}`;
                        }).join("\n") + "\n" + `${eventUrl} .........#${result.timerId}`;
                        },
                        stop_notify: function(){
                        return result.result ? "解除成功" : "解除失敗 QQ";
                        },
                        check: function(){
                        return (result.tickets.allClosed ? "目前所有票種均已售畢 (╥﹏╥)\n" : "") + result.tickets.map((e, i)=>{
                            return `[${i}] ${e.ticketType} ${e.closed ? "(售畢)" : ""}`;
                        }).join("\n");
                        }
                    }

                    returnStr = commandHandlers[command]()

                    return {
                        type: "msg",
                        result: returnStr
                    };
                }
            }
        ])
    }

    return {
        name: "kktix",
        interfaces,
        init,
        initTelegram,
    }
})();
