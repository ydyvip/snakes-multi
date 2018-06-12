
var circleArcCollision = require("./circle-arc-collision.js")
var lineCircleCollision = require("line-circle-collision");
var Arc = require("./arc.js");

function getRad(degree){
  degree = degree % 360;
  if(degree<0){
    degree = 360 + degree;
  }
  var radians = degree * (Math.PI / 180);
  return radians;
}

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



    players.forEach( function(player){

      // test for boundaries

      var c = (
        lineCircleCollision([0,0], [0,799], [player.curpath.end.x, player.curpath.end.y], player.weight/2) ||
        lineCircleCollision([0,799], [799,799], [player.curpath.end.x, player.curpath.end.y], player.weight/2) ||
        lineCircleCollision([799,799], [799,0], [player.curpath.end.x, player.curpath.end.y], player.weight/2) ||
        lineCircleCollision([799,0], [0,0], [player.curpath.end.x, player.curpath.end.y], player.weight/2)
      )
      if(c){
        player.speed = 0;
      }

      players.forEach( function(player_against){

        // test for currently generated path

        var self = player_against.name == player.name;

        if((player_against.dir == "left" || player_against.dir == "right") && !self){

          var angle_90 = 0;
          var counterclockwise = false;

          if(player_against.dir == "left"){
            counterclockwise = true;
            angle_90 = 90;
          }
          if(player_against.dir =="right"){
            angle_90 = -90;
          }

          var c = circleArcCollision({ x: player.curpath.end.x, y: player.curpath.end.y, r: player.weight/2},
            new Arc( player_against.curpath.arc_point.x, player_against.curpath.arc_point.y, player_against.r, getRad(player_against.starting_angle), getRad(player_against.angle + angle_90), player_against.weight, counterclockwise  )
          );
          if(c){
            player.speed = 0;
          }

        }

        if(player_against.dir == "straight" && !self){

          var vertices = player_against.getVerticesFromLinePath();
          var c = (
            lineCircleCollision( vertices[0], vertices[1], [player.curpath.end.x, player.curpath.end.y], player.weight/2 ) ||
            lineCircleCollision( vertices[2], vertices[3], [player.curpath.end.x, player.curpath.end.y], player.weight/2 ) ||
            lineCircleCollision( vertices[3], vertices[0], [player.curpath.end.x, player.curpath.end.y], player.weight/2 ) ||
            lineCircleCollision( vertices[1], vertices[2], [player.curpath.end.x, player.curpath.end.y], player.weight/2 )
          );

          if(c){
            player.speed = 0;
          }

        }


        // test for done paths

        var size = player_against.paths.length;

        player_against.paths.forEach( function(path, index){

          var timestamp = new Date().getTime();
          if(timestamp - path.body.timestamp < 1000){
            return;
          }


          if(path.body.type=="arc")
          {
            var c = circleArcCollision({ x: player.curpath.end.x, y: player.curpath.end.y, r: player.weight/2}, path.body.arc);
            if(c){
              player.speed = 0;
            }
          }

          if(path.body.type=="line")
          {

            var c = (
              lineCircleCollision( path.body.vertices[0], path.body.vertices[1], [player.curpath.end.x, player.curpath.end.y], player.weight/2 ) ||
              lineCircleCollision( path.body.vertices[2], path.body.vertices[3], [player.curpath.end.x, player.curpath.end.y], player.weight/2 ) ||
              lineCircleCollision( path.body.vertices[3], path.body.vertices[0], [player.curpath.end.x, player.curpath.end.y], player.weight/2 ) ||
              lineCircleCollision( path.body.vertices[1], path.body.vertices[2], [player.curpath.end.x, player.curpath.end.y], player.weight/2 )
            );

            if(c){
              player.speed = 0;
            }
          }

        })
      })
    })


  }


}

module.exports = game_state;
