const express = require("express");
const passport = require("passport");
const router = express.Router({mergeParams:true});
const User = require("../models/c28_291_models_user");

router.get("/", (req, res) => {
	res.render("c28_291_home");
})

router.get("/register", (req, res) => {
	res.render("c28_291_register");
})

router.post("/register", (req, res) => {
	const username = String(req.body.username);
	if (username !== username.trim()) {
		req.flash("error", "Username must not start or end with a space character");
		return res.redirect("/register");
	}
	
	const user = new User({username});
	User.register(user, req.body.password, (err, registeredUser) => {
		if (err){
			req.flash("error", err.message);
			return res.redirect("/register");
		}
		passport.authenticate("local")(req, res, () => {
			req.flash("success", "You were successfully registered.");
			res.redirect("/campgrounds");
		})
	})
})

router.get("/login", (req, res) => {
	res.render("c28_291_login.ejs");
})

router.post("/login", 
		 passport.authenticate("local", 
							   {successRedirect:"/campgrounds", 
								failureRedirect:"/login",
							    failureFlash: true
							   }
		 					  ), 
		 (req, res) => {
})

router.get("/logout", (req, res) => {
	req.logout();
	req.flash("success", "You were successfully logged out")
	res.redirect("/campgrounds");
})

module.exports = router;