
function circle(x,y,r){
  this.x = x;
  this.y = y;
  this.r = r;

  this.draw = function(){

    if(!ctx);

    ctx.save();
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
    ctx.fill();
    ctx.restore();
  }

}

module.exports = circle;
