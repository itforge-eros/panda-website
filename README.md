# KMITL OSRS Website

KMITL Online Space Reservation System, website part.

## Getting Started

1. Run `npm i` in the project folder to install required dependencies.
2. Run `node server.js` to start the Web server.

## Contributing

> Always run `gulp` to compile Sass and JS files.

### How to Create a New Page

1. Create a new `.pug` file in the `views` directory. Eg. `single-space.pug`
2. Copy the page structure from `views/template.pug` to your new file and change `body`'s class name to match the file's name (eg. `body.single-space`).
3. Add a new route to `server.js`. Example:

```{javascript}
app.get("/any-url-to-catch", function(req, res) {
	res.render("single-space"); // the Pug file name
});
```

## Project Structure

_coming soon_

## Tips

* If changes don't show up, check if you have already run `gulp` (for front-end) and `node` (for back-end).
* Use `nodemon` instead of `node` to automatically restart the server when the _server code_ changes.