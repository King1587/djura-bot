const fetch = require('node-fetch');
const request = require('request');

const { FACEBOOK_ACCESS_TOKEN } = process.env;


function sendTextMessage (userID, text) {
    return fetch( 
        `https://graph.facebook.com/v3.3/me/messages?access_token=${FACEBOOK_ACCESS_TOKEN}`,
        {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({
                recipient: {
                    id: userID,
                },
                message: {
                    text: text,
                }
            }),
        }
    );
}

function sendAttachmentMessage (userID, payload) {
    const request_body = {
        'recipient': {
            'id': userID
        },
        'message': payload
    };

    request({
        'uri': 'https://graph.facebook.com/v3.3/me/messages',
        'qs': {'access_token': FACEBOOK_ACCESS_TOKEN },
        'method': 'POST',
        'json': request_body
    }, (err) => {
        if (!err) {
            console.log('message sent!');
        } else {
            console.log('Unable to send message:', err);
        }
    });
}

module.exports = { sendTextMessage, sendAttachmentMessage };