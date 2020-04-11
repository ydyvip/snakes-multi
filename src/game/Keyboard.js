function Keyboard(code){

  var key = {};
  key.code = code;
  key.press = undefined;
  key.release = undefined;
  key.isDown = false;
  key.isUp = true;

  key.onDownHandler = function(event){
    if(event.code == key.code){
      event.preventDefault();
      if(key.isUp && key.press)
        key.press();
      key.isDown = true;
      key.isUp = false;
    }
  }
  key.onUpHandler = function(event){
    if(event.code == key.code){
      event.preventDefault();
      if(key.isDown && key.release)
        key.release();
      key.isDown = false;
      key.isUp = true;
    }
  }

  window.addEventListener("keydown", key.onDownHandler, false );
  window.addEventListener("keyup", key.onUpHandler, false );

  return key;

}

module.exports = Keyboard;
