
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
    success: true,
    username: req.user.username,
    balance: req.user.balance_total
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
      balance: req.user.balance_total
    })


})

router.get("/session/balance", function(req,res){

    if(!req.user){
      res.end();
      return;
    }

    res.json({
      balance_total: req.user.balance_total,
      balance_withdrawal: req.user.balance_withdrawal,
      btc_address: req.user.btc_address
    })


})

router.get("/logout", function(req,res){

  req.session.destroy((err)=>{
    res.end();
  })

})

module.exports = router;
