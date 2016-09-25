
module.exports = (function(){

    var fs = require("fs")

    var commandHandler = {}

    var registCommandHandler = ( handlers ) => {
        handlers.forEach((handler) => {
            commandHandler[handler.name] = handler.handler
            console.log("Init Command Handler......", handler.name)
        })
    }

    new Promise((resolve, reject) => {
        fs.readdir("./lib/logic/", (err, files)=>{
            if(err) reject(err);
            else resolve(files);
        });
    }).then(( files )=>{
        files.forEach((file)=>{
            var module = require( "../../logic/"+file );
            console.log("Loading Module From ......", file)
            module.initTelegram && module.initTelegram(registCommandHandler, ()=>{});
        });
    }, (err) => {
        console.log("Something Bad happened....,", err)
    });

    return commandHandler;
})();
