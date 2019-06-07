const {sendTextMessage, sendAttachmentMessage} = require('../messenger/messageSender');
const {addEvent, deleteEvents} = require('../db/mongoClient');


function formatDateTime(date_time) {
    const MONTH_LIST = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const CORRECT_TIME_ZOME = 10800000;  // Plus 3 hours to time in milliseconds.
    const ONE_DAY = 86400000;  // One day in milliseconds

    let formatted_row = '';
    const event_times = new Date(date_time).getTime() + CORRECT_TIME_ZOME;
    const timeAfterOneDay =  event_times + ONE_DAY;
    const hour = new Date(event_times).getHours();
    let minutes = new Date(event_times).getMinutes();
    if (minutes < 10) minutes = `0${minutes}`;
    const day = new Date(event_times).getDate();
    const month = new Date(event_times).getMonth();
    console.log('events time:', event_times);

    if (event_times < timeAfterOneDay) {  // If it`s a today`s event
        if (minutes === '00') formatted_row = `at ${hour} o'clock`;
        else formatted_row = `at ${hour}:${minutes} o'clock`;
    } else {  // If later
        if (minutes === '00') formatted_row = `on ${MONTH_LIST[month]} ${day} at ${hour} o'clock`;
        else formatted_row = `on ${MONTH_LIST[month]} ${day} at ${hour}:${minutes} o'clock`;
    }

    return formatted_row;
}

function filterByName(event_name, remove_name) {
    const word_list = remove_name.split(' ');

    for (let word of word_list) {
        if (event_name.indexOf(word) < 0) return false;
    }

    return true;
}

function timeMaster(date_time, event_name) {
    const TWENTY_HOURS = 43200000;
    const CORRECT_TIMEZONE = 3;
    const ONE_HOUR = 3600000;
    let result;

    if (date_time.structValue) {
        result = {
            startTime: Date.parse(date_time.structValue.fields.startDateTime.stringValue),
            endTime: Date.parse(date_time.structValue.fields.endDateTime.stringValue)
        };
    } else {
        // If user says "todays", "tomorrows".
        if (((new Date(date_time.stringValue).getHours()) === (12 - CORRECT_TIMEZONE)) && (event_name.indexOf('12') < 0)) {
            const day_time = new Date(date_time.stringValue).getTime() + (CORRECT_TIMEZONE * ONE_HOUR);
            result = {
                startTime: day_time - TWENTY_HOURS,
                endTime: day_time + TWENTY_HOURS
            };
        } else result = { startTime: Date.parse(date_time.stringValue) };
    }

    return result;
}

function filterByDate(events_list, date_time, events_name) {
    let delete_list = [];

    for (let event of events_list) {
        if (event.date === date_time) {
            if (events_name) {
                if (filterByName(event.event_name, events_name)) delete_list.push(event);
            } else delete_list.push(event);
        }
    }

    return delete_list;
}

function filterByDuration(events_list, date_time, events_name) {
    let delete_list = [];
    console.log(`Start time: ${date_time.startTime}`);
    console.log(`End time: ${date_time.endTime}`);
    
    for (let event of events_list) {
        console.log(`Event time: ${event.date}`);
        if ((date_time.startTime <= event.date) && (event.date <= date_time.endTime)) {
            if (events_name) {
                if (filterByName(event.event_name, events_name)) delete_list.push(event);
            } else delete_list.push(event);
        }
    }

    return delete_list;
}

function addReminders(sender_psid, response) {
    const name = response.parameters.fields.name.stringValue;
    let date_time = '';

    if (response.parameters.fields.date_time.structValue) {
        date_time = response.parameters.fields.date_time.structValue.fields.date_time.stringValue;
    } else date_time = response.parameters.fields.date_time.stringValue;
    
    console.log(`You reminder: name - ${name}, dateTime - ${date_time}`);    

    if (name && date_time) {
        // const event_time = Date.parse(date_time);

        addEvent(sender_psid, name, date_time);

        const response = `Got it! I remind you ${formatDateTime(date_time)} about ${name}`;
        sendTextMessage(sender_psid, response);

    } else {
        sendTextMessage(sender_psid, response.fulfillmentText);
    }
}

function showReminders(sender_psid, items) {
    let actual_events = [];
    const current_time = Date.now();
    let message = 'You haven`t any events.';

    if (items.length > 0)
        for (let event of items) {
            if (new Date(event.date).getTime() > current_time) actual_events.push(event);
        }
    console.log('actual events::', actual_events);

    if (actual_events.length === 1) {
        message = `You have one event: ${actual_events[0].event_name} ${formatDateTime(actual_events[0].date)}`;
    } else if (actual_events.length > 1) {
        message = `You have ${actual_events.length} events:`;
        for (let i = 0; i < actual_events.length; i++) {
            message += `\n${i + 1}. ${actual_events[i].event_name} ${formatDateTime(actual_events[i].date)}`;
        }
    }

    sendTextMessage(sender_psid, message);
}

function removeReminders(sender_psid, user_events, response) {
    const remove_name = response.parameters.fields.name.stringValue;
    const if_all = response.parameters.fields.all.stringValue;
    let remove_time = timeMaster(response.parameters.fields.date_time, remove_name);
    let events_to_delete = [];

    // If the user removes events by date
    if (remove_time.startTime) {
        if (remove_time.endTime) {
            events_to_delete = filterByDuration(user_events, remove_time, remove_name);
        } else events_to_delete = filterByDate(user_events, remove_time.startTime, remove_name);

    // If the user removes events only by name
    } else if (remove_name) {
        for (let event of user_events) {
            if (filterByName(event.event_name, remove_name)) {
                events_to_delete.push(event);
            }
        }

        console.log('Delete only with name');
    
    // If the user want to remove all his events
    } else if (if_all) {
        events_to_delete = user_events;
    
    }

    console.log(`Events to delete: ${events_to_delete}`);

    if (events_to_delete) {
        deleteEvents(events_to_delete);
        sendTextMessage(sender_psid, 'Your events were deleted.');
    }
}

function welcomeIntent(sender_psid) {
    const welcomeTemplate = require('./templates/welcomeTemplate');

    sendAttachmentMessage(sender_psid, welcomeTemplate());
}

function notify(items) {
    const notifyTemplate = require('./templates/notifyTemplate');

    if (items) {
        for (let event of items) {
            const response = notifyTemplate(event);
            sendAttachmentMessage(event.userID, response);
        }
    }
}

module.exports = { addReminders, showReminders, removeReminders, welcomeIntent, notify };