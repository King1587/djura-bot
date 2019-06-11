const MongoClient = require('mongodb').MongoClient;

const uri = process.env.MONGODB_URI;


function addEvent(user_id, event_name, date) {
    const mongo = new MongoClient(uri, { useNewUrlParser: true });
    mongo.connect((err, client) => {
        if (err) return console.log('Error to conect to Mongo', err);
        
        const collection = client.db('djura').collection('events');
    
        let new_event = {
            event_name: event_name,
            userID: user_id,
            date: date
        };

        console.log('New event:', new_event);
    
        collection.insertOne(new_event, err => {
            if (err) return console.log(`ERROR in insert event to database: ${err}`);
    
            client.close();
        });
    });
}

function findUsersEvents(user_id) {
    return MongoClient(uri, { useNewUrlParser: true }).connect().then(client => {
        const collection = client.db('djura').collection('events');

        return collection.find({userID: user_id}).toArray();
    }).then(items => {
        return items;
    });
}

function getAllEvents() {
    return MongoClient(uri, { useNewUrlParser: true }).connect().then(client => {
        const collection = client.db('djura').collection('events');

        return collection.find().toArray();
    }).then(items => {
        return items;
    });
}

function deleteEvents(events) {
    const mongo = new MongoClient(uri, { useNewUrlParser: true });

    mongo.connect((err, client) => {
        const collection = client.db('djura').collection('events');

        for (let event of events) {
            console.log('event to delete', event);
            collection.deleteOne({ _id: event._id }, err => {
                if (err) return console.log('delete event error', err);

                console.log(`delete event ${event._id} successful`);
            });
        }
    });
}

function snooze(event_id, updated_time) {
    const mongo = new MongoClient(uri, { useNewUrlParser: true });

    mongo.connect((err, client) => {
        const collection = client.db('djura').collection('events');

        console.log('event to update:', event_id);
        console.log('date:', updated_time);

        collection.updateOne(
            { _id: event_id },
            {$set:{ date: updated_time } },
            (err, result) => {
                if (err) return console.log('ERROR in update Mongo function:', err);

                console.log(result);
            }
        );
    });
}

module.exports = { addEvent, findUsersEvents, getAllEvents, deleteEvents, snooze };