var express = require("express"),
    router = express.Router(),
    Campground = require("../models/campground"),
    middleware = require("../middleware");

// INDEX ROUTE - display a list of all campgrounds
router.get("/", function(req, res) {
    // get all campgroudns from DB
    Campground.find({}, function(err, allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds : allCampgrounds, currentUser: req.user});
        }
    })
});

// CREATE ROUTE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res) {
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCG = {name: name, price: price, image: image, description: desc, author: author};
    Campground.create(newCG, function(err, campground) {
        if (err) {
            console.log(err);
        } else {
            req.flash("success", "Campground created successfully"); 
            res.redirect("/campgrounds");
        }
    });
});

// NEW - display form to add a new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

// SHOW - show more information about one campground
router.get("/:id", function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCG) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/show", {campground: foundCG});
        }
    })
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground) {
        if (err) {
            req.flash("error", "Campground not found");
        }
        res.render("campgrounds/edit", {campground: foundCampground});
    });         
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    // find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Campground updated successfully"); 
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// DESTROY CAMPGROUD ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Campground delete successfully"); 
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;