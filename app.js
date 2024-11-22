if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const flash = require("connect-flash");
const multer = require("multer");
const { storage } = require("./cloudConfig.js");
const upload = multer({ storage });

const userRouter = require("./routes/user.js");
const listingController = require("./controllers/listings.js");
const reviewController = require("./controllers/reviews.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

async function main() {
  await mongoose.connect(process.env.ATLASDB_URL);
}

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

// const checkToken = ((req, res, next) => {
//   let { token } = req.query;
//   if(token === "data") {
//     next();
//   }
//     res.send("ACCESS DENIED !!");
// });

// app.use("/api", checkToken, (req, res) => {
//   res.send("Data");
// });

app.use("/", userRouter);

const sessionOptions = {
  secret: "mysupersecetcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expiree: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};
app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  next();
});

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
  res.send("Wellcome to wanderlust");
});

// Index Route
app.get("/listing", wrapAsync(listingController.index));

// New Route
app.get("/listing/new", listingController.renderNewForm);

// Show Route
app.get("/listing/:id", wrapAsync(listingController.showListing));

// Create Route
app.post(
  "/listings",
  upload.single("listing[image]"),
  wrapAsync(listingController.createListing)
);

// Edit Route
app.get("/listings/:id/edit", wrapAsync(listingController.renderEditForm));

// Update Route
app.put(
  "/listings/:id",
  upload.single("listing[image]"),
  wrapAsync(listingController.updateListing)
);

// Delete Route
app.delete("/listings/:id", wrapAsync(listingController.destroyListing));

// Review Route
app.get("/listings/:id/review", reviewController.showReviewForm);

app.post("/listings/:id/review", reviewController.addReview);

// Delete Review Route
app.delete("/listings/:id/reviews/:reviewId"),
  wrapAsync(reviewController.deleteReview);

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found :("));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong !!" } = err;
  res.render("./listings/error.ejs", { err });
});

app.listen(8080, () => {
  console.log("Server Is Listening To : localhost:8080/listing");
});
