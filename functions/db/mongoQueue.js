/* eslint-disable no-console */
const { findUsersEvents, getAllEvents } = require('./mongoClient');

function getReminders(senderPSID, callback, response) {
  findUsersEvents(senderPSID).then(
    items => {
      console.log('get reminder items -', items.length);
      callback(senderPSID, items, response);
    },
    err => {
      console.log('The promise was rejected', err, err.stack);
    },
  );
}

function getAllReminder(callback) {
  getAllEvents().then(
    items => {
      console.log('getAllReminder is working');
      callback(items);
    },
    err => {
      console.log('The promis was rejected', err.stack);
    },
  );
}

module.exports = { getReminders, getAllReminder };
