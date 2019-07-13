const fetch = require('node-fetch');
const request = require('request');
const log = require('../logger')(__filename);

const { FACEBOOK_ACCESS_TOKEN } = process.env;

function sendTextMessage(userID, text) {
  return fetch(
    `https://graph.facebook.com/v3.3/me/messages?access_token=${FACEBOOK_ACCESS_TOKEN}`,
    {
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      body: JSON.stringify({
        recipient: {
          id: userID,
        },
        message: {
          text,
        },
      }),
    },
  );
}

function sendAttachmentMessage(userID, message) {
  const requestBody = {
    recipient: {
      id: userID,
    },
    message,
  };

  request(
    {
      uri: 'https://graph.facebook.com/v3.3/me/messages',
      qs: { access_token: FACEBOOK_ACCESS_TOKEN },
      method: 'POST',
      json: requestBody,
    },
    err => {
      if (err) log.error('Unable to send message:', err);
      else log.info('message sent!');
    },
  );
}

module.exports = { sendTextMessage, sendAttachmentMessage };
