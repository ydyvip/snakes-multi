
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

function GameState() {

  this.player_consideration = true;
  this.tm_quit_consideration = 0;

}

GameState.prototype.detectCollision = function(players, game_serv, tm){

    for( var player of players){

      if(player.speed == 0 || player.collision_tm != 0){
        continue;
      }

      // test for boundaries

      var c = (
        lineCircleCollision([0,0], [0,800], [player.curpath.end.x, player.curpath.end.y], player.weight/2) ||
        lineCircleCollision([0,800], [800,800], [player.curpath.end.x, player.curpath.end.y], player.weight/2) ||
        lineCircleCollision([800,800], [800,0], [player.curpath.end.x, player.curpath.end.y], player.weight/2) ||
        lineCircleCollision([800,0], [0,0], [player.curpath.end.x, player.curpath.end.y], player.weight/2)
      )
      if(c){
        console.log("Collision details:");
        console.log(player.name + " collided with " + "wall at " + tm);
        if(game_serv)
          game_serv.collisionDetected(player, tm);
      }

      // no collision for player in gap (breakout);
      if(this.player_consideration || player.curpath.on_breakout)
        continue;

      // TODO: apply for .. of
      players.forEach( function(player_against){

        // test for curpath

        var self = player_against.name == player.name;

        // 360 degree collision on curpath
        if(self && (player_against.curpath.dir=="left" || player_against.curpath.dir=="right" ))
        {
          var degree_per_1px = 360 / (2*Math.PI*player_against.r);
          var degree_distance = degree_per_1px * player_against.weight/2; // radius in degree

          var c = Math.abs(player_against.curpath.angle - player_against.curpath.base_start_angle) > (360-degree_distance);
          if(c){
            console.log("Collision details:");
            console.log(player.name + " collided with self 360 deg.");
            if(game_serv)

              game_serv.collisionDetected(player, tm);
          }
        }

        if(player_against.curpath.on_breakout == false && !self){

          if(player_against.curpath.dir == "left" || player_against.curpath.dir == "right"){

            var angle_90 = 0;
            var counterclockwise = false;

            if(player_against.curpath.dir == "left"){
              counterclockwise = true;
              angle_90 = 90;
            }
            if(player_against.curpath.dir =="right"){
              angle_90 = -90;
            }

            let c = circleArcCollision({ x: player.curpath.end.x, y: player.curpath.end.y, r: player.weight/2},
              new Arc( player_against.curpath.arc_point.x, player_against.curpath.arc_point.y, player_against.r, getRad(player_against.curpath.starting_angle), getRad(player_against.curpath.angle + angle_90), player_against.weight, counterclockwise  )
            );
            if(c){
              console.log("Collision details:");
              console.log(player.name + " collided with " + player_against.name + " at " + tm );
              console.log("curpath-curpath (id-id): " + player.curpath.id + " : " + player_against.curpath.id );
              if(game_serv)
                game_serv.collisionDetected(player, tm, "curpath-curpath", player_against);
            }

          }

          if(player_against.curpath.dir == "straight"){

            let c = false;

            var vertices = player_against.getVerticesFromLinePath();
             c = (
              lineCircleCollision( vertices[0], vertices[1], [player.curpath.end.x, player.curpath.end.y], player.weight/2 ) ||
              lineCircleCollision( vertices[2], vertices[3], [player.curpath.end.x, player.curpath.end.y], player.weight/2 ) ||
              lineCircleCollision( vertices[3], vertices[0], [player.curpath.end.x, player.curpath.end.y], player.weight/2 ) ||
              lineCircleCollision( vertices[1], vertices[2], [player.curpath.end.x, player.curpath.end.y], player.weight/2 )
            );


            if(c){
              console.log("Collision details:");
              console.log(player.name + " collided with " + player_against.name + " at " + tm);
              console.log("curpath-curpath (id-id): " + player.curpath.id + " : " + player_against.curpath.id );
              if(game_serv)
                game_serv.collisionDetected(player, tm, "curpath-curpath", player_against);
            }

          }
        }

        // test for done paths

        var size = player_against.paths.length;
        var tm_elapsed = 0;
        if(self){
          tm_elapsed = tm - player_against.curpath.tm;
        }
        for( var i = size-1; i>=0; i--){

          var path = player_against.paths[i];

          // check time elapsed since particular path to avoid collision after changeDir
          if(self && tm_elapsed<500){
            tm_elapsed = tm - path.body.tm;
            continue;
          }

          if(path.body.on_breakout==true){
            continue;
          }

          if(path.body.type=="arc")
          {
            let c = circleArcCollision({ x: player.curpath.end.x, y: player.curpath.end.y, r: player.weight/2}, path.body.arc);
            if(c){
              console.log("Collision details:");
              console.log(player.name + " collided with " + player_against.name + " at " + tm);
              console.log("curpath-donepath (id-id): " + player.curpath.id + " : " + path.body.id );
              if(game_serv)
                game_serv.collisionDetected(player, tm);
            }
          }

          if(path.body.type=="line")
          {
            let c = (
              lineCircleCollision( path.body.vertices[0], path.body.vertices[1], [player.curpath.end.x, player.curpath.end.y], player.weight/2 ) ||
              lineCircleCollision( path.body.vertices[2], path.body.vertices[3], [player.curpath.end.x, player.curpath.end.y], player.weight/2 ) ||
              lineCircleCollision( path.body.vertices[3], path.body.vertices[0], [player.curpath.end.x, player.curpath.end.y], player.weight/2 ) ||
              lineCircleCollision( path.body.vertices[1], path.body.vertices[2], [player.curpath.end.x, player.curpath.end.y], player.weight/2 )
            );

            if(c){
              console.log("Collision details:");
              console.log(player.name + " collided with " + player_against.name + " at " + tm);
              console.log("curpath-donepath (id-id): " + player.curpath.id + " : " + path.body.id );
              if(game_serv)
                game_serv.collisionDetected(player, tm);
            }
          }
        } // DONE PATHS loop
      })
    }


  }


module.exports = GameState;
