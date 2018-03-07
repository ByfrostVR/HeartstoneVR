var express = require('express');
var router = express.Router();

/* GET game scene page. */
router.get('/', function(req, res, next) {
  //from the views folder
  res.render('scene', { title: 'Scene' });
});

module.exports = router;
