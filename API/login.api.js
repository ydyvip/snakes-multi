
var router = require("express").Router();
var passport = require("passport");

router.post("/", passport.authenticate("json"), function(req, res){

  // authentication successfull, req.user populated
  // if authentication fails, Passport will respond with a 401 Unauthorized status
  // Strategies must be configured prior to using them in a route

  if(!req.body.rememberMe){
    req.session.cookie.expires = false;
  }

  res.json({
    success: true
  })

});

// get initial data from user
router.get("/session", function(req,res){

    if(!req.user){
      res.end();
      return;
    }

    res.json({
      username: req.user.username,
      btc_address: req.user.btc_address,
      balance: req.user.balance
    })


})

module.exports = router;
