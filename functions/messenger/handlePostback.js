const webhookDetectIntent = require('../dialogflow/webhookDetectIntent');
const ObjectId = require('mongodb').ObjectID;
const mongoClient = require('../db/mongoClient');


function handlePostback(sender_psid, received_postback) {
    let response;
    
    // Get the payload for the postback
    let payload = received_postback.payload;
  
    // Set the response based on the postback payload
    if (payload === 'add_reminder') {
        response = {'text': 'Create a new reminder'};

    } else if (payload === 'events_list') {
        response = {'text': 'Show all reminders'};

    } else if (payload.indexOf('stop_remind') >= 0) {
        const event_id = payload.split(',')[1];
        console.log(`payload stop event:${event_id}.`);

        mongoClient.deleteEvents([ {_id: ObjectId(event_id)} ]);

    } else if (payload.indexOf('snooze_10min') >= 0) {
        const TEN_MIN = 600000;
        const event_id = ObjectId(payload.split(',')[1]);
        const event_time = new Date(+payload.split(',')[2] + TEN_MIN).toISOString();
        console.log('payload snooze event:', event_id);

        mongoClient.snooze(event_id, event_time);

    } else if (payload.indexOf('snooze_1hour') >= 0) {
        const ONE_HOUR = 3600000;
        const event_id = ObjectId(payload.split(',')[1]);
        const event_time = new Date(+payload.split(',')[2] + ONE_HOUR).toISOString();
        console.log('payload snooze event:', event_id);

        mongoClient.snooze(event_id, event_time);
        
    }
    
    // Send the message to acknowledge the postback
    if (response) webhookDetectIntent(sender_psid, response);
}

module.exports = handlePostback;