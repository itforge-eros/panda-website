![KMITL OSRS](https://zartre.com/files/KMITL-OSRS.png)
# Project Panda Website 🐼

Welcome to the development documentation of **Project Panda** (or _The Panda Project_), aka _KMITL Online Space Reservation System_.

# 🗂 The Panda Project
The Panda Project sources are hosted on GitHub.

* Project Panda API : [itforge-eros/panda-api](https://github.com/itforge-eros/panda-api)
* Project Panda Front End : [itforge-eros/panda-website](https://github.com/itforge-eros/panda-website)
* Project Panda Documentation : [itforge-eros/panda-docs](https://github.com/itforge-eros/panda-docs)

# 🚀 Starting up the server

1. Run `npm i` in the project folder to install required dependencies.
2. Run `node server.js` to start the Web server.

The website can now be accessed at `localhost:3000`.

# 🛠 Contributing
We are happy to let you become part of the project.

> Note: Pull request approval starts on May 7, 2018.

Steps to contribute to our project
1. [Fork](https://help.github.com/articles/fork-a-repo/) our repository
2. Edit the code on your forked repository
3. Go to our repository and [create a new pull request](https://help.github.com/articles/creating-a-pull-request/)
4. We will review your code, and eventually pull your code to our repository.
5. You have made our system shinier everyday!

> Always run `gulp` to compile Sass and JS files.

### How to Create a New Page

1. Create a new `.pug` file in the `views` directory. Eg. `single-space.pug`.
2. Copy the page structure from `views/template.pug` to your new file and change `body`'s class name to match the file's name (eg. `body.single-space`).
3. Add a new route to `server.js`. Example:

```{javascript}
app.get("/any-url-to-catch", function(req, res) {
	res.render("single-space"); // the Pug file name
});
```

### How to Create a New Script File

1. Create a new `.js` file in the `src-scripts` directory. Eg. `single-space.js`.
2. Include the file in a Pug page by adding `script(src="public/scripts/single-space.js")` to the page.

> File name should match the page's file name where possible.

## Project Structure

```
panda-website/
├── models/		<-- classes
├── node_modules/	<-- Node module resources
├── public/		<-- Publicly-accessible directory
├── routes/		<-- route handlers
├── src-scripts/	<-- Source script files
├── src-styles/		<-- Source style files
├── views/		<-- Page files
├── .gitignore
├── globalVars.js	<-- Global variables for JS files
├── LICENSE.txt
├── README.md
├── gulpfile.js
├── package-lock.json
├── package.json
└── server.js		<-- Runnable server application
```

## Tips

* If changes don't show up, check if you have already run `gulp` (for front-end) and `node` (for back-end).
* Use `nodemon` instead of `node` to automatically restart the server when the _server code_ changes.

# 👨‍👩‍👧‍👦 Team Members
We are from Information Technology, King Mongkut Institute of Technology Ladkrabang

||First Name|Last Name|GitHub Username|Student ID|
|:-:|--|------|---------------|---------|
|<img src="https://avatars1.githubusercontent.com/u/20960087" width="75px">|Kavin|Ruengprateepsang|[@kavinvin](https://github.com/kavinvin)|59070009|
|<img src="https://avatars3.githubusercontent.com/u/13056824" width="75px">|Kunanon|Srisuntiroj|[@sagelga](https://github.com/sagelga)|59070022|
|<img src="https://avatars2.githubusercontent.com/u/22119886" width="75px">|Thitipat|Worrarat|[@ynhof6](https://github.com/ynhof6)|59070043|
|<img src="https://avatars0.githubusercontent.com/u/3814520" width="75px">|Nathan|Yiangsupapaanontr|[@DobaKung](https://github.com/DobaKung)|59070087|
|<img src="https://avatars1.githubusercontent.com/u/20330195" width="75px">|Pornprom|Kiawjak|[@foofybuster](https://github.com/foofybuster)|59070113|

This repository is part of these subjects
- Web Programming 06016215
- Information System and Analysis 06016216
- Database System Concepts 06016217
