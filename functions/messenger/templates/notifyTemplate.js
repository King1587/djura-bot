/* eslint-disable no-underscore-dangle */
function notifyTemplate(event) {
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: [
          {
            title: `Hi. You have the event: ${event.event_name}`,
            subtitle: 'What do you want to do?',
            buttons: [
              {
                type: 'postback',
                title: 'Stop remind',
                payload: `stop_remind,${event._id}`,
              },
              {
                type: 'postback',
                title: 'Snooze 10 min',
                payload: `snooze_10min,${event._id},${new Date(event.date).getTime()}`,
              },
              {
                type: 'postback',
                title: 'Snooze 1 hour',
                payload: `snooze_1hour,${event._id},${new Date(event.date).getTime()}`,
              },
            ],
          },
        ],
      },
    },
  };
}

module.exports = notifyTemplate;
