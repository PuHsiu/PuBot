
module.exports = (function(){

    const util = require("util"),
          botAPI = require("./telegramBotAPI");;

    var chatList = {
        list: [],
        add: function( chatObj ){
            
            if( this.has( chatObj ) )
                return this.getIndex( chatObj );

            let index = this.list.push(chatObj) - 1;

            return index;
        },
        remove: function( chatListIndex ){

            if( !this.list[chatListIndex] )
                return false;

            delete this.list[chatListIndex];

            return true;
        },
        get: function( chatListIndex ){
            return this.list[chatListIndex];
        },
        has: function( chatObj ){
            return this.list.some( (e) => chatObj.equal(e) );
        },
        getIndex: function( chatObj ){
            return this.list.findIndex( (e) => chatObj.equal(e) );
        }
    };

    function Chat(){
        throw new Error("Construct a chat via Chat.createByMessage.");      
    };

    Chat.createByMessage = function( msg ){

        if( !msg.chat || !msg.chat.type ){
            console.log(msg);
            throw new Error("Invalid construct parameter.");
        }

        if( "private" === msg.chat.type ){
            let chatObj = new PrivChat( msg.chat.id );
            let chatListIndex = chatList.add( chatObj );
            return chatListIndex;
        } else {
            throw new Error("Not supported chat type.");
        }
    };

    Chat.destroyById = function( chatListIndex ){
        return chatList.remove( chatListIndex );
    };

    Chat.send = function( chatListIndex, message ){
        
        var chatObj = chatList.get(chatListIndex)
        
        if( !chatObj )
            throw new Error("ChatObj is not found.");

        return botAPI.send( chatObj.chatId, message );
    };

    Chat.prototype.equal = function( otherObj ){
        return otherObj.chatId === this.chatId;
    };

    function PrivChat( chatId ){
        this.chatId = chatId;
    }

    util.inherits( PrivChat, Chat );

    return Chat;
})();
