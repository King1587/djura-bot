/* eslint-disable no-restricted-syntax */
const { sendTextMessage, sendAttachmentMessage } = require('../messenger/messageSender');
const { addEvent, deleteEvents } = require('../db/mongoClient');
const messengerTemplates = require('../messenger/templates');
const log = require('../logger')(__filename);

function formatDateTime(dateTime) {
  const MONTH_LIST = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const CORRECT_TIME_ZOME = 3 * 60 * 60 * 1000; // Plus 3 hours to time in milliseconds.
  const ONE_DAY = 24 * 60 * 60 * 1000; // One day in milliseconds

  let formattedRow = '';
  const eventTimes = new Date(dateTime).getTime() + CORRECT_TIME_ZOME;
  const timeAfterOneDay = eventTimes + ONE_DAY;
  const hour = new Date(eventTimes).getHours();
  let minutes = new Date(eventTimes).getMinutes();
  if (minutes < 10) minutes = `0${minutes}`;
  const day = new Date(eventTimes).getDate();
  const month = new Date(eventTimes).getMonth();
  log.info('events time:', eventTimes);

  if (eventTimes < timeAfterOneDay) {
    // If it`s a today`s event
    if (minutes === '00') formattedRow = `at ${hour} o'clock`;
    else formattedRow = `at ${hour}:${minutes} o'clock`;
    // If later:
  } else if (minutes === '00') formattedRow = `on ${MONTH_LIST[month]} ${day} at ${hour} o'clock`;
  else formattedRow = `on ${MONTH_LIST[month]} ${day} at ${hour}:${minutes} o'clock`;

  return formattedRow;
}

function filterByName(eventName, removeName) {
  const wordList = removeName.split(' ');

  // AHAHAH

  for (const word of wordList) {
    if (eventName.indexOf(word) < 0) return false;
  }

  return true;
}

function timeMaster(dateTime, eventName) {
  const ONE_HOUR = 60 * 60 * 1000;
  const TWENTY_HOURS = 12 * 60 * 60 * 1000;
  const CORRECT_TIMEZONE = 3;
  let result;

  if (dateTime.structValue) {
    result = {
      startTime: Date.parse(dateTime.structValue.fields.startDateTime.stringValue),
      endTime: Date.parse(dateTime.structValue.fields.endDateTime.stringValue),
    };
    // If user says "todays", "tomorrows":
  } else if (
    new Date(dateTime.stringValue).getHours() === 12 - CORRECT_TIMEZONE &&
    eventName.indexOf('12') < 0
  ) {
    const dayTime = new Date(dateTime.stringValue).getTime() + CORRECT_TIMEZONE * ONE_HOUR;
    result = {
      startTime: dayTime - TWENTY_HOURS,
      endTime: dayTime + TWENTY_HOURS,
    };
  } else result = { startTime: Date.parse(dateTime.stringValue) };

  return result;
}

function filterByDate(eventsList, dateTime, eventsName) {
  const deleteList = [];

  for (const event of eventsList) {
    if (event.date === dateTime) {
      if (eventsName) {
        if (filterByName(event.event_name, eventsName)) deleteList.push(event);
      } else deleteList.push(event);
    }
  }

  return deleteList;
}

function filterByDuration(eventsList, dateTime, eventsName) {
  const deleteList = [];

  for (const event of eventsList) {
    log.info(`Event time: ${event.date}`);
    if (dateTime.startTime <= event.date && event.date <= dateTime.endTime) {
      if (eventsName) {
        if (filterByName(event.event_name, eventsName)) deleteList.push(event);
      } else deleteList.push(event);
    }
  }

  return deleteList;
}

function addReminders(senderPSID, response) {
  const name = response.parameters.fields.name.stringValue;
  let dateTime = '';

  if (response.parameters.fields.date_time.structValue) {
    dateTime = response.parameters.fields.date_time.structValue.fields.date_time.stringValue;
  } else dateTime = response.parameters.fields.date_time.stringValue;

  log.info(`You reminder: name - ${name}, dateTime - ${dateTime}`);

  if (name && dateTime) {
    // const event_time = Date.parse(date_time);

    addEvent(senderPSID, name, dateTime);

    const message = `Got it! I remind you ${formatDateTime(dateTime)} about ${name}`;
    sendTextMessage(senderPSID, message);
  } else {
    sendTextMessage(senderPSID, response.fulfillmentText);
  }
}

function showReminders(senderPSID, items) {
  const actualEvents = [];
  const currentTime = Date.now();
  let message = 'You haven`t any events.';

  if (items.length > 0)
    for (const event of items) {
      if (new Date(event.date).getTime() > currentTime) actualEvents.push(event);
    }
  log.info('actual events::', actualEvents);

  if (actualEvents.length === 1) {
    message = `You have one event: ${actualEvents[0].event_name} ${formatDateTime(
      actualEvents[0].date,
    )}`;
  } else if (actualEvents.length > 1) {
    message = `You have ${actualEvents.length} events:`;
    for (let i = 0; i < actualEvents.length; i += 1) {
      message += `\n${i + 1}. ${actualEvents[i].event_name} ${formatDateTime(
        actualEvents[i].date,
      )}`;
    }
  }

  sendTextMessage(senderPSID, message);
}

function removeReminders(senderPSID, userEvents, response) {
  const removeName = response.parameters.fields.name.stringValue;
  const ifAll = response.parameters.fields.all.stringValue;
  const removeTime = timeMaster(response.parameters.fields.date_time, removeName);
  let eventsToDelete = [];

  // If the user removes events by date
  if (removeTime.startTime) {
    if (removeTime.endTime) {
      eventsToDelete = filterByDuration(userEvents, removeTime, removeName);
    } else eventsToDelete = filterByDate(userEvents, removeTime.startTime, removeName);

    // If the user removes events only by name
  } else if (removeName) {
    for (const event of userEvents) {
      if (filterByName(event.event_name, removeName)) {
        eventsToDelete.push(event);
      }
    }

    log.info('Delete only with name');

    // If the user want to remove all his events
  } else if (ifAll) {
    eventsToDelete = userEvents;
  }

  log.info(`Events to delete: ${eventsToDelete}`);

  if (eventsToDelete) {
    deleteEvents(eventsToDelete);
    sendTextMessage(senderPSID, 'Your events were deleted.');
  }
}

function welcomeIntent(senderPSID) {
  const { welcomeTemplate } = messengerTemplates;

  sendAttachmentMessage(senderPSID, welcomeTemplate());
}

function notify(items) {
  const { notifyTemplate } = messengerTemplates;

  if (items) {
    for (const event of items) {
      const response = notifyTemplate(event);
      sendAttachmentMessage(event.userID, response);
    }
  }
}

module.exports = { addReminders, showReminders, removeReminders, welcomeIntent, notify };
