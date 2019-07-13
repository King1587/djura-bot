/* eslint-disable consistent-return */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

function addEvent(userID, eventName, date) {
  const mongo = new MongoClient(uri, { useNewUrlParser: true });
  mongo.connect((err, client) => {
    if (err) return console.log('Error to conect to Mongo', err);

    const collection = client.db('djura').collection('events');

    const newEvent = {
      event_name: eventName,
      userID,
      date,
    };

    console.log('New event:', newEvent);

    collection.insertOne(newEvent, error => {
      if (error) return console.log(`ERROR in insert event to database: ${error}`);

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
      console.log('event to delete', event);
      // eslint-disable-next-line no-underscore-dangle
      collection.deleteOne({ _id: event._id }, error => {
        if (error) return console.log('delete event error', error);

        // eslint-disable-next-line no-underscore-dangle
        console.log(`delete event ${event._id} successful`);
      });
    }
  });
}

function snooze(eventID, updatedTime) {
  const mongo = new MongoClient(uri, { useNewUrlParser: true });

  mongo.connect((err, client) => {
    const collection = client.db('djura').collection('events');

    console.log('event to update:', eventID);
    console.log('date:', updatedTime);

    collection.updateOne({ _id: eventID }, { $set: { date: updatedTime } }, (error, result) => {
      if (error) return console.log('ERROR in update Mongo function:', error);

      console.log(result);
    });
  });
}

module.exports = { addEvent, findUsersEvents, getAllEvents, deleteEvents, snooze };
