
var router = require("express").Router();
var passport = require("passport");

router.post("/", passport.authenticate("json"), function(req, res){

  // authentication successfull, req.user populated
  // if authentication fails, Passport will respond with a 401 Unauthorized status
  // Strategies must be configured prior to using them in a route

  res.json({
    success: true
  })

});

module.exports = router;
