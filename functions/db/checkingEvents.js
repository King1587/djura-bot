const {deleteEvents} = require('./mongoClient');
const mongoQueue = require('./mongoQueue');
const {notify} = require('../dialogflow/executorDesires');

const SIX_MINUTES = 360000;  // In milliseconds
const ONE_HOUR = 3600000;


function finder(items) {
    let current_time = Date.now();
    let checking_time = current_time + SIX_MINUTES;
    let time_to_delete = current_time - ONE_HOUR;
    let evens_to_delete = [];
    let evens_to_remind = [];

    if (items) {

        console.log('items length: ', items.length);
        for (let event of items) {
            const event_time = new Date(event.date).getTime();
            if (event_time < time_to_delete) {
                evens_to_delete.push(event);
    
            } else if ((event_time <= checking_time) && (event_time >= current_time)) {
                evens_to_remind.push(event);
            }
        }
    
        if (evens_to_remind) notify(evens_to_remind);
    
        if (evens_to_delete) deleteEvents(evens_to_delete);
    
    }
}

function checkingEvents(req, res) {
    mongoQueue.getAllReminder(finder);

    res.status(200).send();
}

module.exports = checkingEvents;