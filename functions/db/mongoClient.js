/* eslint-disable consistent-return */
/* eslint-disable no-restricted-syntax */
const { MongoClient } = require('mongodb');
const log = require('../logger')(__filename);

const uri = process.env.MONGODB_URI;

function addEvent(userID, eventName, date) {
  const mongo = new MongoClient(uri, { useNewUrlParser: true });
  mongo.connect((err, client) => {
    if (err) return log.error('Error to conect to Mongo', err);

    const collection = client.db('djura').collection('events');

    const newEvent = {
      event_name: eventName,
      userID,
      date,
    };

    log.info('New event:', newEvent);

    collection.insertOne(newEvent, error => {
      if (error) return log.info(`ERROR in insert event to database: ${error}`);

      client.close();
    });
  });
}

function findUsersEvents(userID) {
  return MongoClient(uri, { useNewUrlParser: true })
    .connect()
    .then(client => {
      const collection = client.db('djura').collection('events');

      return collection.find({ userID }).toArray();
    })
    .then(items => items);
}

function getAllEvents() {
  return MongoClient(uri, { useNewUrlParser: true })
    .connect()
    .then(client => {
      const collection = client.db('djura').collection('events');

      return collection.find().toArray();
    })
    .then(items => items);
}

function deleteEvents(events) {
  const mongo = new MongoClient(uri, { useNewUrlParser: true });

  mongo.connect((err, client) => {
    const collection = client.db('djura').collection('events');

    for (const event of events) {
      log.info('event to delete', event);
      // eslint-disable-next-line no-underscore-dangle
      collection.deleteOne({ _id: event._id }, error => {
        if (error) return log.error('delete event error', error);

        // eslint-disable-next-line no-underscore-dangle
        log.info(`delete event ${event._id} successful`);
      });
    }
  });
}

function snooze(eventID, updatedTime) {
  const mongo = new MongoClient(uri, { useNewUrlParser: true });

  mongo.connect((err, client) => {
    const collection = client.db('djura').collection('events');

    log.info('event to update:', eventID);
    log.info('date:', updatedTime);

    collection.updateOne({ _id: eventID }, { $set: { date: updatedTime } }, (error, result) => {
      if (error) return log.info('ERROR in update Mongo function:', error);

      log.info(result);
    });
  });
}

module.exports = { addEvent, findUsersEvents, getAllEvents, deleteEvents, snooze };
