var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //from the views folder
  res.render('homePage', { title: 'Home Page' });
});

module.exports = router;
