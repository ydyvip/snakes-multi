
var circleArcCollision = require("./circle-arc-collision.js")
var lineCircleCollision = require("line-circle-collision");



var game_state = {

  curosorPlayerCollision: function(cursor, player){

    player.paths.forEach( function(path){

      if(path.body.type=="arc")
      {

        var c = circleArcCollision(cursor, path.body.arc);
        if(c){
          path.body.color = "red";
        }
        else{
          path.body.color = path.body.defaultColor
        }
      }

      if(path.body.type=="line")
      {

        var c = (
          lineCircleCollision( path.body.vertices[0], path.body.vertices[1], [cursor.x, cursor.y], cursor.r ) ||
          lineCircleCollision( path.body.vertices[2], path.body.vertices[3], [cursor.x, cursor.y], cursor.r ) ||
          lineCircleCollision( path.body.vertices[3], path.body.vertices[0], [cursor.x, cursor.y], cursor.r ) ||
          lineCircleCollision( path.body.vertices[1], path.body.vertices[2], [cursor.x, cursor.y], cursor.r )
        );

        ctx.save();

        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(path.body.vertices[0][0], path.body.vertices[0][1], 4, 0, 2*Math.PI);
        ctx.fill();

        ctx.fillStyle = "pink";
        ctx.beginPath();
        ctx.arc(path.body.vertices[1][0], path.body.vertices[1][1], 4, 0, 2*Math.PI);
        ctx.fill();

        ctx.fillStyle = "cyan";
        ctx.beginPath();
        ctx.arc(path.body.vertices[2][0], path.body.vertices[2][1], 4, 0, 2*Math.PI);
        ctx.fill();

        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(path.body.vertices[3][0], path.body.vertices[3][1], 4, 0, 2*Math.PI);
        ctx.fill();



        ctx.restore();

        if(c){
          path.body.color = "red";
        }
        else{
          path.body.color = path.body.defaultColor
        }

      }

    });

  },


  detectCollision: function(players){

    players.forEach( (player)=>{

      for(var i = 0; i<players.length; i++){

        var self;
        var last_path;

        if(player.name == players[i].name){
          self = true;
        }
        else {
          self= false;
        }

        var len = players[i].paths.length;

        players[i].paths.forEach( (path, index)=>{

          if(path.body.type == "arc"){

          if( self && len == index+1)
            return;

         	  var c = circleArcCollision({
              x: player.curpath.end.x,
              y: player.curpath.end.y,
              r: player.weight/2
            },  path.body.arc );

           if(c)
              player.speed = 0;

             //var c = circleArcCollision(player.curpath.end.x, player.curpath.end.y, player.weight/2, path.body.x, path.body.y, path.body.r, path.body.starting_angle, path.body.ending_angle, 15  );



          }

        })

      }

    })


  }


}

module.exports = game_state;
