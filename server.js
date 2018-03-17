const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Hello World'));

app.listen(3000, () => console.log('Listening at port 3000\nPress Ctrl+C to stop'));
