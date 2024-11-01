const User = require("../models/user.js");

module.exports.signupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.getSignedUp = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({username , email});
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser,(err) => {
          if(err) {
            return next(err);
          }
        res.redirect("/listing");
      });
    } catch (err) {
        res.redirect("/listing");
    }
};

module.exports.loginForm = (req, res) => {
    res.render("users/login.ejs")
};

module.exports.getLoggedIn = async (req, res) => {
    res.redirect("/listing");
};

module.exports.getLoggedOut = (req, res, next) => {
    req.logout((err) => {
      if(err) {
        return next(err);
      }
      req.flash("success", "You are Logged Out !!");
      res.redirect("/listing");
    });
};