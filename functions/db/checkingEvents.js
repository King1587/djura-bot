/* eslint-disable no-restricted-syntax */
const { deleteEvents } = require('./mongoClient');
const mongoQueue = require('./mongoQueue');
const { notify } = require('../dialogflow/executorDesires');
const log = require('../logger')(__filename);

const SIX_MINUTES = 6 * 60 * 1000; // In milliseconds
const ONE_HOUR = 60 * 60 * 1000;

function finder(items) {
  const currentTime = Date.now();
  const checkingTime = currentTime + SIX_MINUTES;
  const timeToDelete = currentTime - ONE_HOUR;
  const evensToDelete = [];
  const evensToRemind = [];

  if (items) {
    log.info('items length: ', items.length);
    for (const event of items) {
      const eventTime = new Date(event.date).getTime();
      if (eventTime < timeToDelete) {
        evensToDelete.push(event);
      } else if (eventTime <= checkingTime && eventTime >= currentTime) {
        evensToRemind.push(event);
      }
    }

    if (evensToRemind) notify(evensToRemind);

    if (evensToDelete) deleteEvents(evensToDelete);
  }
}

function checkingEvents(req, res) {
  mongoQueue.getAllReminder(finder);

  res.status(200).send();
}

module.exports = checkingEvents;
