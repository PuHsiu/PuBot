var fs = require('fs'),
    EventEmitter = require('events').EventEmitter;

;(function initModules(){

    var modules = {}, promiseQueue = [];

    var controller = new EventEmitter();

    controller.on("logic", (mission)=>{
        var next = mission.next;
        modules[next.module].interfaces.emit( next.port, mission );
    });

    controller.on("error", (mission)=>{
        console.log(error);
    });

    ["./lib/edge/", "./lib/logic/"].forEach((path) => {
        promiseQueue.push(new Promise((resolve, reject) => {
            fs.readdir(path, (err, files)=>{
                if(err) reject(err);
                else resolve([path, files]);
            });
        }).then(( [path, files] )=>{
            files.forEach((file)=>{
                var module = require( path+file );
                modules[module.name] = module;
                module.init && module.init(controller);
            });   
        }));
    });
})();
