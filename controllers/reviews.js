const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

module.exports.showReviewForm = (req, res) => {
  res.render("./listings/review.ejs");
};

module.exports.addReview = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  req.flash("success", "New Review Created !!");
  res.redirect(`/listing/${id}`);
};

module.exports.deleteReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "New Review Deleted !!");
  res.redirect(`/listing/${id}`);
};
