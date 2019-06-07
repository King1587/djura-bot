function webhookVerify(req, res) {
    const VERIFY_TOKEN = 'abz57ht99oop34';

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.status(403);
        }
    }
}

module.exports = webhookVerify;