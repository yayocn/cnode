const checkUserLogin = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
}

module.exports = checkUserLogin;