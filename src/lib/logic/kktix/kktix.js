
module.exports = (function(){

    var EventEmitter = require("events").EventEmitter,
        request = require("request"),
        cheerio = require("cheerio"),
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

            return Promise.resolve(result);
        });
    }

    interfaces.on("notify", ( mission )=>{

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

        var quota = [];

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

    function init( c ){
        controller = c;
    }

    return {
        name: "kktix",
        interfaces,
        init
    }
})();
