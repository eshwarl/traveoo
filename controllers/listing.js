const Listing=require("../models/listing.js");
const mbxGeoCoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geoCodingClient = mbxGeoCoding({ accessToken:mapToken});
// index route
module.exports.index=async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  };
// new route
  module.exports.renderNewForm=(req, res) => {
    res.render("listings/new.ejs");
  }

// showroute
  module.exports.showListing=async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author", // Ensure the author field is populated
        },
      })
      .populate("owner");

    if (!listing) {
      req.flash("error", "Listing doesn't exist");
      return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
  };
//   create route
module.exports.createListing = async (req, res) => {
  try {
    // Perform geocoding
    let response = await geoCodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    }).send();

    let geometry = response.body.features[0].geometry;

    // File handling
    let url = req.file?.path || "";
    let filename = req.file?.filename || "";

    // Create new listing
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = geometry;

   let savedListing= await newListing.save();
   console.log(savedListing);

    req.flash("success", "New listing created");
    res.redirect("/listings"); // Send a single response
  } catch (error) {
    console.error("Error during listing creation:", error.message);
    req.flash("error", "Failed to create listing. Please try again.");
    res.redirect("/listings/new"); // Send an error response
  }
};


//   edit route

module.exports.renderEditForm=async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash("error", "Listing doesn't exist");
      return res.redirect("/listings");
    }

    res.render("listings/edit.ejs", { listing });
  };

  module.exports.updateListing=async (req, res) => {
    const { id } = req.params;
   let listing= await Listing.findByIdAndUpdate(id, { ...req.body.listing });
   if(typeof req.file!=="undefined"){
   let url= req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
   }
    req.flash("success", "Listing updated successfully");
    res.redirect(`/listings/${id}`);
  };
//   destroy listing
module.exports.destroyListing=async (req, res) => {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);

    if (deletedListing) {
      req.flash("success", "Listing deleted successfully");
    } else {
      req.flash("error", "Listing could not be deleted");
    }

    res.redirect("/listings");
  };