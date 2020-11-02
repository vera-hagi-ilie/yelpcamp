const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv")
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const passport = require("passport");
const expressSession = require("express-session");
const expressSanitizer = require("express-sanitizer");
const PassportLocal = require("passport-local");
const MongoStore = require("connect-mongo")(expressSession);

const Campground = require("./models/c28_291_models_campground");
const Comment = require("./models/c28_291_models_comment");
const User = require("./models/c28_291_models_user");

const campgroundsRoutes = require("./routes/c28_291_routes_campgrounds");
const commentsRoutes = require("./routes/c28_291_routes_comments");
const indexRoutes = require("./routes/c28_291_routes_index");

//-------ENVIRONMENT SETUP---
dotenv.config({path: "./config.env"})
const env = process.env.ENVIRONMENT
const productionDBUrl = process.env.ATLAS_DB_URL
const testDBUrl = process.env.LOCAL_DB
const sessionSecret = process.env.EXPRESS_SESSION_SECRET

const dbUrl = (env === "production") ? productionDBUrl : testDBUrl;

//-------EXPRESS SETUP-------
var app = express();
app.use(methodOverride("_method"));
app.use(expressSanitizer());
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(flash());

app.use(expressSession({
	secret: sessionSecret,
	store: new MongoStore({url: dbUrl, 
						   secret: sessionSecret, 
						   touchAfter: 24*60*60}),
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new PassportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.errorMessage = req.flash("error");
	res.locals.successMessage = req.flash("success");
	next();
})

app.set("view engine", "ejs");

//-------ROUTES SETUP--------
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/comments", commentsRoutes);

//-------MONGOOSE SETUP------
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);

mongoose.connect(dbUrl);


//--------START SERVER--------
app.listen(3000, function(){
	console.log("Server started");
})