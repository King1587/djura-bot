const webhookDetectIntent = require('../dialogflow/webhookDetectIntent');
const handlePostback = require('./handlePostback');


const webhookMessage = (req, res) => { 
    const body = req.body;
    
    if (body.object === 'page') {
        body.entry.forEach(entry => {
            const event = entry.messaging[0];
            const sender_psid = event.sender.id;

            console.log(event.message);
            console.log(`Sender PSID: ${sender_psid}`);

            if (event.postback) {
                handlePostback(sender_psid, event.postback);
                console.log('postback:', event.postback);
            } else if (event.message) {
                webhookDetectIntent(sender_psid, event.message);
            }
        });

        res.status(200).send();
    } else {
        res.status(404);
    }
};

module.exports = webhookMessage;