/* eslint-disable no-console */
const { ObjectID } = require('mongodb');
const webhookDetectIntent = require('../dialogflow/webhookDetectIntent');
const mongoClient = require('../db/mongoClient');

function handlePostback(senderPSID, receivedPostback) {
  let response;

  // Get the payload for the postback
  const { payload } = receivedPostback;

  // Set the response based on the postback payload
  if (payload === 'add_reminder') {
    response = { text: 'Create a new reminder' };
  } else if (payload === 'events_list') {
    response = { text: 'Show all reminders' };
  } else if (payload.indexOf('stop_remind') >= 0) {
    const eventID = payload.split(',')[1];
    console.log(`payload stop event:${eventID}.`);

    mongoClient.deleteEvents([{ _id: ObjectID(eventID) }]);
  } else if (payload.indexOf('snooze_10min') >= 0) {
    const TEN_MIN = 600000;
    const eventID = ObjectID(payload.split(',')[1]);
    const eventTime = new Date(+payload.split(',')[2] + TEN_MIN).toISOString();
    console.log('payload snooze event:', eventID);

    mongoClient.snooze(eventID, eventTime);
  } else if (payload.indexOf('snooze_1hour') >= 0) {
    const ONE_HOUR = 3600000;
    const eventID = ObjectID(payload.split(',')[1]);
    const eventTime = new Date(+payload.split(',')[2] + ONE_HOUR).toISOString();
    console.log('payload snooze event:', eventID);

    mongoClient.snooze(eventID, eventTime);
  }

  // Send the message to acknowledge the postback
  if (response) webhookDetectIntent(senderPSID, response);
}

module.exports = handlePostback;
