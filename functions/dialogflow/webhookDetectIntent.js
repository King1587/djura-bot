const dialogflow = require('dialogflow');
const {sendTextMessage} = require('../messenger/messageSender');
const executorDesires = require('./executorDesires');
const mongoQueue = require('../db/mongoQueue');

const projectId = 'djura-bot';
const sessionId = '438456';
const languageCode = 'en-US';

const config = {
    credentials: {
        private_key: process.env.DIALOGFLOW_PRIVATE_KEY,
        client_email: process.env.DIALOGFLOW_CLIENT_EMAIL
    }
};


function definitionIntent(sender_psid, response) {
    if (response.intent.displayName === 'add_reminders') {
        console.log('add_reminders intent');
        executorDesires.addReminders(sender_psid, response);

    } else if (response.intent.displayName === 'get_reminders') {
        console.log('get_reminders intent');
        mongoQueue.getReminders(sender_psid, executorDesires.showReminders);

    } else if (response.intent.displayName === 'remove_reminders') {
        console.log('remove_reminders intent');
        mongoQueue.getReminders(sender_psid, executorDesires.removeReminders, response);

    } else if (response.intent.displayName === 'Default Welcome Intent') {
        executorDesires.welcomeIntent(sender_psid);
        console.log('welcome intent');
        sendTextMessage(sender_psid, response.fulfillmentText);

    } else {
        sendTextMessage(sender_psid, response.fulfillmentText);
    }
}

function detectTextIntent(sender_psid, event) {
    const sessionClient = new dialogflow.SessionsClient(config);
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);
    const message = event.text;

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode: languageCode,
            },
        },
    };

    sessionClient.detectIntent(request)
        .then(responses => {
            const response = responses[0].queryResult;
            definitionIntent(sender_psid, response);
        })
        .catch(err => {
            console.error('detectIntent ERROR:', err);
        });
}

module.exports = detectTextIntent;