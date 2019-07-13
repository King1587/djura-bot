/* eslint-disable no-console */
const dialogflow = require('dialogflow');
const { sendTextMessage } = require('../messenger/messageSender');
const executorDesires = require('./executorDesires');
const mongoQueue = require('../db/mongoQueue');

const projectId = 'djura-bot';
const sessionId = '438456';
const languageCode = 'en-US';

const config = {
  credentials: {
    private_key: process.env.DIALOGFLOW_PRIVATE_KEY,
    client_email: process.env.DIALOGFLOW_CLIENT_EMAIL,
  },
};

function definitionIntent(senderPSID, response) {
  if (response.intent.displayName === 'add_reminders') {
    console.log('add_reminders intent');
    executorDesires.addReminders(senderPSID, response);
  } else if (response.intent.displayName === 'get_reminders') {
    console.log('get_reminders intent');
    mongoQueue.getReminders(senderPSID, executorDesires.showReminders);
  } else if (response.intent.displayName === 'remove_reminders') {
    console.log('remove_reminders intent');
    mongoQueue.getReminders(senderPSID, executorDesires.removeReminders, response);
  } else if (response.intent.displayName === 'Default Welcome Intent') {
    executorDesires.welcomeIntent(senderPSID);
    console.log('welcome intent');
    sendTextMessage(senderPSID, response.fulfillmentText);
  } else {
    sendTextMessage(senderPSID, response.fulfillmentText);
  }
}

function detectTextIntent(senderPSID, event) {
  const sessionClient = new dialogflow.SessionsClient(config);
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);
  const message = event.text;

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode,
      },
    },
  };

  sessionClient
    .detectIntent(request)
    .then(responses => {
      const response = responses[0].queryResult;
      definitionIntent(senderPSID, response);
    })
    .catch(err => {
      console.error('detectIntent ERROR:', err);
    });
}

module.exports = detectTextIntent;
