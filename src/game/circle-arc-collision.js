
var lineCircleCollision = require("line-circle-collision");
var Circle = require("./circle.js");

function circleArcCollision (circle, arc ){

    var bx = circle.x;
    var by = circle.y;
    var ball_radius = circle.r;

    var ax = arc.x;
    var ay = arc.y;
    var ar = arc.r;
    var start, end;

    // counterclockwise = true --> arc.dir == left

    var cross360 = false;

    if(!arc.counterclockwise){

      start = arc.start;
      end = arc.end;

      if(end<start){
        end += 2*Math.PI;
        cross360 = true;
      }

    }
    else{

      start = arc.end;
      end = arc.start;

      if(end<start){
        end += 2*Math.PI;
        cross360 = true;
      }

    }

    
    var aw = arc.width;

    var innerRadius = ar - aw/2;
    var outerRadius = ar + aw/2;

    /* Now all the fun mathsy stuff */

    var collides = false;

	  var cx = ax;
	  var cy = ay;

    var dx = bx - cx; //[bx, by] = ball coords
    var dy = by - cy; //[cx, cy] = center coords

    //get distance and direction to ball from center


    var dist = Math.sqrt(dx * dx + dy * dy);
    var dir = Math.atan2(dy, dx); // BUG: atan2 to jest kurwiszon maly

    //  console.log(start + " : " + end);

    if(dir<0){
      dir = 2*Math.PI + dir;
    }

    if(cross360 && dir<start){
      dir+= 2*Math.PI;
    }




    //angles for tangents to ball from center
    var tangent_angle =  Math.asin(ball_radius/ dist);
    var dir0 = (dir + tangent_angle);
    var dir1 = (dir - tangent_angle);

  //  console.log(start + " " + end + " " + dir0 + " " + dir1)

//    dir0 = dir0 % (Math.PI*2);
//    if(dir1<0)
//      dir1 = 2*Math.PI + dir1;

    //check if distance is good
    if (dist + ball_radius > innerRadius && dist - ball_radius < outerRadius)
    {
        //check edges of ball against start and end of arc
        //var d = dir > start && dir < end;
        var d0 = dir0 > start && dir0 < end;
        var d1 = dir1 > start && dir1 < end;

        //if both tangents are inside the angular measure
        if ( d0 && d1)
        {
            collides = true;
        }
        //otherwise if one tangent is inside
        //We need to test the outside corners more precisely...
        else if (d0 != d1)
        {



          var p1 = new Circle( ax + innerRadius * Math.cos(start),
                              ay + innerRadius * Math.sin(start),  3);

          var p2 = new Circle( ax + outerRadius * Math.cos(start),
                              ay + outerRadius * Math.sin(start),  3);

          var col1 = lineCircleCollision([p1.x, p1.y], [p2.x, p2.y], [bx, by], ball_radius);

          var p3 = new Circle( ax + innerRadius * Math.cos(end),
                              ay + innerRadius * Math.sin(end),  3);

          var p4 = new Circle( ax + outerRadius * Math.cos(end),
                              ay + outerRadius * Math.sin(end),  3);

          var col2 = lineCircleCollision([p3.x, p3.y], [p4.x, p4.y], [bx, by], ball_radius);



          if(col1 || col2){
            collides = true;
          }

        }
    }

	return collides;
}

module.exports = circleArcCollision;
