
module.exports = (function(){

    var handlers = {};

    handlers.echo = ( ...args )=>{
        return {
            msg: args.join(" ")  
        };
    }

    return handlers;
})();
