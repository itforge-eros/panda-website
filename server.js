const express = require('express');
const app = express();
const env = process.env.NODE_ENV || 'dev';
const port = (env == 'production' ? 80 : 3000);

// Set view location
app.set('views', './views');
// Set template engine
app.set('view engine', 'pug');
// Set publicly-accessible path
app.use('/public', express.static(__dirname + '/public'));

// Data
let searchPageData = {env: env, title: 'Search', user: 'Nathan', isApprover: true, isAdmin: true};

// Routes
app.get('/', function(req, res) {
	res.render('index', searchPageData);
});

// Start the server
app.listen(port, () => console.log('Listening on port 3000\nPress Ctrl+C to stop'));
