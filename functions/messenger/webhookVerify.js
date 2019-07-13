const log = require('../logger')(__filename);

function webhookVerify(req, res) {
  const { VERIFY_TOKEN } = process.env;

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      log.info('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.status(403);
    }
  }
}

module.exports = webhookVerify;
