const {findUsersEvents, getAllEvents} = require('./mongoClient');


function getReminders(sender_psid, callback, response) {
    findUsersEvents(sender_psid).then(items => {
        console.log('get reminder items -', items.length);
        callback(sender_psid, items, response);
    }, err => {
        console.log('The promise was rejected', err, err.stack);
    });
}

function getAllReminder(callback) {
    getAllEvents().then(items => {
        console.log('getAllReminder is working');
        callback(items);
    }, err => {
        console.log('The promis was rejected', err.stack);
    });
}

module.exports = {getReminders, getAllReminder};