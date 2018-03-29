# KMITL OSRS Website

KMITL Online Space Reservation System, website part.

## Getting Started

1. Run `npm i` in the project folder to install required dependencies.
2. Run `node server.js` to start the Web server.

## Contributing

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
├── node_modules/	<-- Node module resources
├── public/			<-- Publicly-accessible directory
├── src-scripts/	<-- Source script files
├── src-styles/		<-- Source style files
├── views/			<-- Page files
├── .gitignore
├── LICENSE.txt
├── README.md
├── gulpfile.js
├── package-lock.json
├── package.json
├── server.js		<-- Runnable server application
```

## Tips

* If changes don't show up, check if you have already run `gulp` (for front-end) and `node` (for back-end).
* Use `nodemon` instead of `node` to automatically restart the server when the _server code_ changes.