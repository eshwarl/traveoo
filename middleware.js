const Listing=require("./models/listing");
const Review = require("./models/review");
module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
      req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged in to create listing");
        return res.redirect("/login");
      }
      next()
}
module.exports.saveRedirectUrl=(req,res,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl=req.session.redirectUrl;
  }
  next();
}

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
      req.flash("error", "Listing doesn't exist");
      return res.redirect("/listings");
  }

  if (!listing.owner.equals(res.locals.currUser._id)) {
      req.flash("error", "you are not authorized owner");
      return res.redirect(`/listings/${id}`);
  }

  next();
};

module.exports.isReviewOwner = async (req, res, next) => {
  const { id, reviewId } = req.params; // `id` is the listing ID, `reviewId` is the review ID
  const review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review doesn't exist");
    return res.redirect(`/listings/${id}`);
  }

  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not authorized to modify this review");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

