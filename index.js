'use strict';
// require('dotenv').config({ path: 'variables.env' });

const express = require('express');
const bodyParser = require('body-parser');
const webhookVerify = require('./functions/messenger/webhookVerify');
const webhookMessage = require('./functions/messenger/webhookMessage');
const checkingEvents = require('./functions/db/checkingEvents');

const { PORT } = process.env;

const app = express().use(bodyParser.json()).use(bodyParser.urlencoded({ extended: true }));


app.listen(PORT, () => console.log(`Webhook is listening on ${PORT} port.`));

app.get('/webhook', webhookVerify);

app.post('/webhook', webhookMessage);

app.post('/checking', checkingEvents);

// Google Authorization page
app.get('/google3f3b45ccc4ea4d56.html', (req, res) => {
    res.sendFile(`${__dirname}/static/google3f3b45ccc4ea4d56.html`);
});

app.get('/', (req, res) => res.send('Server is working.'));