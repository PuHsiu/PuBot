module.exports = (function(){

  var express = require('express'),
      bodyParser = require('body-parser');

  var app = new express();

  routerList = {};

  app.use(bodyParser.json());

  function regist( namespace ){

    if(routerList[namespace]){
      throw new Error("Namespace Conflict.");
    }

    router = express.Router();

    router.mount = function(){
      app.use("/"+namespace, router);
    }

    routerList[namespace] = router;

    return router;
  }

  function start(){
    app.listen(
      process.env.NODE_PORT || 30001,
      process.env.NODE_IP || "localhost",
      function( ...args ){
        console.log("Server Started.");
    });
  }

  return {
    regist,
    start
  }
})();