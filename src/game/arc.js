

function arc(x,y,r, start, end, width, counterclockwise = false){

  this.x = x;
  this.y = y;
  this.r = r;

  this.counterclockwise = counterclockwise;

  this.start = start
  this.end = end;

  this.width = width;

  this.innerRadius = r - width/2;
  this.outerRadius = r + width/2;

  this.color = "blue";

  this.path = new Path2D();
  this.path.arc(this.x, this.y, this.r, this.start, this.end, this.counterclockwise);

  this.draw = function(){

    if(!ctx)
      return;

    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width;
    ctx.beginPath();
    ctx.stroke(this.path);
    ctx.restore();

  }


}

module.exports = arc;
