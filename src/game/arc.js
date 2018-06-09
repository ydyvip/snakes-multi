

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




}

module.exports = arc;
