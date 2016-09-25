
module.exports = (function(){



    }

    var handlers = {};

    handlers.echo = ( args )=>{

        var options = {
            msg: args.join(" ")
        }

        return [ "echo", options ];
    }

    handlers.kktix = ( args )=>{

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

        var commandOptions = parseCommandOption(args);

        Object.keys(commandOptions).forEach((commandOptionType)=>{
            if( !optionsDecorator[commandOptionType] )
                throw new Error(`Option ${commandOptionType} is not supported`);

            optionsDecorator[commandOptionType](commandOptions[commandOptionType]);
        });

        options.kkCommand = command;

        return [command, options];
    }

    handlers.bbcall = ( args )=>{
        var options = {
            id: args[1]
        }

        return [args[0], options];
    }

    handlers.conf = ( args ) => {

      var options = {
        eventName: args[1]
      }

      return [args[0], options];
    }

    return handlers;
})();
