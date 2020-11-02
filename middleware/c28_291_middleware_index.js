const Campground = require("../models/c28_291_models_campground");
const Comment = require("../models/c28_291_models_comment");

const middleware = {};

middleware.checkCampgroundOwnership = (req, res, next) => {
	Campground.findById(req.params.id, (err, campground) => {
		if (err){
			req.flash("error", "Campground not found");
			res.redirect("back");
		}else{
			if (campground.author.userId.equals(req.user.id) || req.user.username === process.env.ADMIN){
				next();	
			}else{
				req.flash("error", "You are not the owner of this campground.");
				res.redirect("/campgrounds/" + req.params.id);
			}
		}
	})
}

middleware.checkCommentOwnership = (req, res, next) => {
	Comment.findById(req.params.comment_id, (err, comment) => {
		if (err){
			req.flash("error", "Comment not found");
			res.redirect("back");
		}else{
			if (comment.author.userId.equals(req.user.id) || req.user.username === process.env.ADMIN){
				next();	
			}else{
				req.flash("error", "You are not the owner of this comment.");
				res.redirect("/campgrounds/" + req.params.id);
			}
		}
	})
}


middleware.isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You must be logged in for this.");
	res.redirect("/login");
}

module.exports = middleware;