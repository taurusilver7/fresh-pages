const mongoose = require("mongoose");
const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const exphnds = require("express-handlebars");
const methodOverride = require("method-override");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

const connectDB = require("./config/db");

// load env config
dotenv.config({ path: "./config/config.env" });

// passport config
require("./config/passport")(passport);

// database config
connectDB();

//^^^^^^ app config  ^^^^^//
const app = express();

// body-parser config
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

// method-override for req from templates to api
app.use(
	methodOverride(function (req, res) {
		if (req.body && typeof req.body === "object" && "_method" in req.body) {
			// look in urlencoded POST bodies and delete it
			let method = req.body._method;
			delete req.body._method;
			return method;
		}
	}),
);

// req log data
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// handlebars helpers
const {
	formatDate,
	stripTags,
	truncate,
	editIcon,
	select,
	json,
	gt,
	eq,
	inc,
} = require("./utils/hbs");

// templates- handlebars
app.engine(
	".hbs",
	exphnds({
		helpers: {
			formatDate,
			stripTags,
			truncate,
			editIcon,
			select,
			json,
			gt,
			eq,
			inc,
		},
		defaultLayout: "main",
		extname: ".hbs",
		runtimeOptions: {
			allowProtoPropertiesByDefault: true,
			allowProtoMethodsByDefault: true,
		},
	}),
);
app.set("view engine", ".hbs");
app.use(express.static("images"));

// express sessions
app.use(
	session({
		secret: "keyboard cat",
		resave: false,
		saveUninitialized: false,
		store: new MongoStore({ mongooseConnection: mongoose.connection }),
	}),
);
// passport middlewares
app.use(passport.initialize());
app.use(passport.session());

// set global variables for /stories/index.hbs to use user out of the loop
app.use(function (req, res, next) {
	res.locals.user = req.user || null;
	next();
});

// config static folder [directory]
app.use(express.static(path.join(__dirname, "public")));

// api routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

module.exports = app;
