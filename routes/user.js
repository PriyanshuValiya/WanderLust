const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const session = require("express-session");
const passport = require("passport");

const userController = require("../controllers/users.js");

const sessionOptions = {
  secret: "mysupersecetcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expiree: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};
router.use(session(sessionOptions));

router
  .route("/signup")
  .get(userController.signupForm)
  .post(wrapAsync(userController.getSignedUp));

// router.get("/signup", userController.signupForm);
// router.post("/signup", wrapAsync(userController.getSignedUp));

router.get("/login", userController.loginForm);

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.getLoggedIn
);

router.get("/logout", userController.getLoggedOut);

module.exports = router;
