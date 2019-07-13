const { findUsersEvents, getAllEvents } = require('./mongoClient');
const log = require('../logger')(__filename);

function getReminders(senderPSID, callback, response) {
  findUsersEvents(senderPSID).then(
    items => {
      log.info('get reminder items -', items.length);
      callback(senderPSID, items, response);
    },
    err => {
      log.error('The promise was rejected', err, err.stack);
    },
  );
}

function getAllReminder(callback) {
  getAllEvents().then(
    items => {
      log.info('getAllReminder is working');
      callback(items);
    },
    err => {
      log.error('The promis was rejected', err.stack);
    },
  );
}

module.exports = { getReminders, getAllReminder };
