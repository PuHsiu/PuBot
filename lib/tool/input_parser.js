
module.exports = (function(){

    function parseCommandOption( args ){

        var options = {}, token;

        while( token = args.shift() ){

            if( !token.startsWith("--") ){
                options.extra = [token].concat(args);
                break;
            }

            let optionType = token.replace(/^--/, "");
            let i, len;

            for( i = 0, len = args.length; i < len; ++i ){
                if( args[i].startsWith("--"))
                    break;
            }

            options[optionType] = args.splice(0, i);
        }

        return options;
    }

    return {
        parseCommandOption
    }
})()
