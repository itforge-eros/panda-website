const express = require('express');
const app = express();

// Set view location
app.set('views', './views');
// Set template engine
app.set('view engine', 'pug');
// Set publicly-accessible path
app.use('/public', express.static(__dirname + '/public'));

// Routes
app.get('/', function(req, res) {
	res.render('index', {title: 'Hello'});
});

// Start the server
app.listen(3000, () => console.log('Listening on port 3000\nPress Ctrl+C to stop'));
