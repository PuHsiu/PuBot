var fs = require('fs'),
    EventEmitter = require('events').EventEmitter,
    route = require('./lib/core/route'),
    dbConn = require("./lib/core/mysql");

;
(function initModules() {

    var modules = {},
        promiseQueue = [];

    var controller = new EventEmitter();

    controller.on("logic", (mission) => {
        var next = mission.next;
        modules[next.module].interfaces.emit(next.port, mission);
    });

    controller.on("error", (mission) => {
        console.log(error);
    });

    rootRouter = route.regist("");
    rootRouter.get("/", function(req, res, next) {
        res.send("It's work.");
    })
    rootRouter.mount();

    ["./lib/edge/", "./lib/logic/"].forEach((path) => {
        promiseQueue.push(new Promise((resolve, reject) => {
            fs.readdir(path, (err, files) => {
                if (err) reject(err);
                else resolve([path, files]);
            });
        }).then(([path, files]) => {
            files.forEach((file) => {
                var module = require(path + file);
                modules[module.name] = module;
                module.init && module.init(controller, { regist: route.regist }, dbConn);
                console.log("Init Module......", module.name)
            });

            return Promise.resolve();
        }));
    });

    Promise.all(promiseQueue).then(() => {
        route.start()
    }, (r) => { console.log(r) })
})();