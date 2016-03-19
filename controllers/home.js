/**
 * GET /
 * Home page.
 */
exports.index = function(req, res) {
  if (req.user) {
      res.redirect('/reader');
  } else {
      res.render('home', {
        title: 'Home'
      });
  }
};
