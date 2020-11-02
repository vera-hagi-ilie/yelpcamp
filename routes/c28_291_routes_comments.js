const express = require("express");
const router = express.Router({mergeParams:true});
const Campground = require("../models/c28_291_models_campground");
const Comment = require("../models/c28_291_models_comment");
const middleware = require("../middleware/c28_291_middleware_index");
const {defaultErrorMessage} = require("../constants/c28_291_messages");


router.get("/new", middleware.isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (err){
			req.flash("error", defaultErrorMessage);
			res.redirect("back");
		}else{
			res.render("comments/c28_291_comments_new", {selectedCampground:campground})
		}
	})
})

router.post("/", middleware.isLoggedIn, (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (err){
			req.flash("error", defaultErrorMessage);
			res.redirect("back");
		}else{
			const newComment = {text: req.sanitize(req.body.newComment["text"]), 
							    author:{
								  userId: req.user.id, 
								  username: req.user.username
							   }}
			Comment.create(newComment, (err, comment) => {
				if (err){
					req.flash("error", "Comment could not be created");
					res.redirect("back");
				}else{
					campground.comments.push(comment);
					campground.save();
					req.flash("success", "Comment added successfully");
					res.redirect("/campgrounds/"+ campground.id);
				}
			})
		}
	})
})

router.get("/:comment_id/edit", middleware.isLoggedIn, middleware.checkCommentOwnership, (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (err){
			req.flash("error", defaultErrorMessage);
			res.redirect("back");
		}else{
			Comment.findById(req.params.comment_id, (err, comment) => {
				if (err){
					req.flash("error", "Comment not found");
					res.redirect("back");
				}else{
					res.render("comments/c28_291_comments_edit", {selectedComment:comment, selectedCampground:campground});
				}
			})
		}
	})
})

router.put("/:comment_id", middleware.isLoggedIn, middleware.checkCommentOwnership, (req,res) => {
	Comment.findByIdAndUpdate(req.params.comment_id, 
							  req.sanitize(req.body.editedComment), 
							  (err, comment) => {
									if(err){
										req.flash("error", defaultErrorMessage);
										res.redirect("back");
									}else{
										req.flash("success", "Comment updated");
										res.redirect("/campgrounds/" + req.params.id);
									}
							  }
	)
})

router.delete("/:comment_id", middleware.isLoggedIn, middleware.checkCommentOwnership, (req, res) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (err){
			req.flash("error", defaultErrorMessage);
			return res.redirect("back");
		}else{
			let index = campground.comments.indexOf(req.params.comment_id);
			if (index > -1){
				campground.comments.splice(index, 1);
			}
			campground.save();
		}
	});	
	
	Comment.findByIdAndRemove(req.params.comment_id, (err) => {
		if (err){
			req.flash("error", defaultErrorMessage);
		}else{
			req.flash("success", "Comment deleted successfully")
		}
		res.redirect("/campgrounds/" + req.params.id);
	})
})


module.exports = router;