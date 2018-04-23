const gulp = require("gulp");
const sass = require("gulp-sass");
const rename = require("gulp-rename");
const srcmaps = require("gulp-sourcemaps");
const autoprefixer = require("gulp-autoprefixer");
const minifyjs = require("gulp-js-minify");
const babel = require("gulp-babel");

gulp.task("sass", function() {
	return gulp
		.src("src-styles/main.sass")
		.pipe(srcmaps.init())
		.pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
		.pipe(
			autoprefixer({
				browsers: ["last 2 versions"],
				cascade: false
			})
		)
		.pipe(rename("style.css"))
		.pipe(srcmaps.write("./"))
		.pipe(gulp.dest("./public/styles/"));
});

gulp.task("js", function() {
	return gulp
		.src("src-scripts/**/*.js")
		.pipe(srcmaps.init())
		.pipe(minifyjs())
		.pipe(srcmaps.write("./"))
		.pipe(gulp.dest("./public/scripts/"));
});

gulp.task("watch", function() {
	gulp.watch("src-styles/**/*.sass", ["sass"]);
	gulp.watch("src-scripts/**/*.js", ["js"]);
	console.log("Watching for changes...");
});

gulp.task("default", ["watch"]);
