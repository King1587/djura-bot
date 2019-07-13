const webhookDetectIntent = require('../dialogflow/webhookDetectIntent');
const handlePostback = require('./handlePostback');
const log = require('../logger')(__filename);

const webhookMessage = (req, res) => {
  const { body } = req;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      const event = entry.messaging[0];
      const senderPSID = event.sender.id;

      log.info(event.message);
      log.info(`Sender PSID: ${senderPSID}`);

      if (event.postback) {
        handlePostback(senderPSID, event.postback);
        log.info('postback:', event.postback);
      } else if (event.message) {
        webhookDetectIntent(senderPSID, event.message);
      }
    });

    res.status(200).send();
  } else {
    res.status(404);
  }
};

module.exports = webhookMessage;
