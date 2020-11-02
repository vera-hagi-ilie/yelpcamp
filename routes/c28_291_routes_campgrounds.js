const express = require("express");
const router = express.Router({mergeParams:true});
const Campground = require("../models/c28_291_models_campground");
const Comment = require("../models/c28_291_models_comment");
const middleware = require("../middleware/c28_291_middleware_index");

router.get("/", (req, res) => {
	Campground.find({}, (err, allCampgrounds) => {
		if (err){
			req.flash("error", err.message);
		}else{
			res.render("campgrounds/c28_291_campgrounds_index", {campings:allCampgrounds});
		}
	})
})

router.get("/new", middleware.isLoggedIn, (req, res) => {
	res.render("campgrounds/c28_291_campgrounds_new");
})

router.post("/", middleware.isLoggedIn, (req, res) => {
	if ((String(req.body.campName).trim() === "") || (String(req.body.image).trim() === "")) {
		req.flash("error", "Please fill in with valid data");
		return res.redirect("/campgrounds/new");;
	}
	const campgroundAuthor = {
		userId: req.user.id,
		username: req.user.username
	};
	const newCampground = {
		name: req.sanitize(req.body.campName), 
		image: req.sanitize(req.body.image), 
		description: req.sanitize(req.body.description), 
		author:campgroundAuthor
	};
	Campground.create(newCampground, (err, campground) => {
		if(err){
			req.flash("error", "Campground could not be created");
		}else{
			res.redirect("/campgrounds");
		}
	})	
})

router.get("/:id", (req, res) => {
	Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
		if(err){
			req.flash("error", "Campground not found");
		}
		else{
			res.render("campgrounds/c28_291_campgrounds_show", {selectedCampground:foundCampground});
		}
	})
})

router.get("/:id/edit", middleware.isLoggedIn, middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		if(err){
			req.flash("error", "Campground not found");
		}
		else{
			res.render("campgrounds/c28_291_campgrounds_edit", {selectedCampground:foundCampground});
		}
	})
})

router.put("/:id", middleware.isLoggedIn, middleware.checkCampgroundOwnership, (req, res) => {
	const editedCampground = {
		name: req.sanitize(req.body.editedCampground["name"]),
		image: req.sanitize(req.body.editedCampground["image"]),
		description: req.sanitize(req.body.editedCampground["description"])
	}
	Campground.findByIdAndUpdate(req.params.id, 
								 editedCampground, 
								 (err, updatedCampground) => {
									if (err){
										req.flash("error", "Something went wrong");
									}else{
										req.flash("success", "Campground successfully updated");		
									}
									res.redirect("/campgrounds/" + req.params.id);
								  }
	)
})

router.delete("/:id", middleware.isLoggedIn, middleware.checkCampgroundOwnership, (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		campground.comments.forEach((comment) => {
			Comment.findByIdAndRemove(comment, (err) => {
				if (err){
					console.log(err);
				}
			});
		})
		while (campground.comments.length > 0){
			campground.comments.pop();
		}	
	});
	Campground.findByIdAndRemove(req.params.id, (err) => {
		if (err){
			req.flash("error", "Campground could not be deleted");
		}else{
			req.flash("success", "Campground successfully deleted");
		}
		res.redirect("/campgrounds");
	})
})


module.exports = router;