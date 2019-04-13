var express = require('express');
var router = express.Router();

function getId() {
  let id = ParseInt(Math.random() * (1e9 + 5));
  return id.toString(16);
}

/* redirect to real home page. */
router.get('/', function(req, res, next) {
  res.redirect('/sesh/' + getId());
});

module.exports = router;
