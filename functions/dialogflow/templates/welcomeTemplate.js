function welcomeTemplate() {
    return {
        'attachment': {
            'type': 'template',
            'payload': {
                'template_type': 'button',
                'text': 'Can I help you?',
                'buttons': [
                    {
                        'type': 'postback',
                        'title': 'Create reminder',
                        'payload': 'add_reminder'
                    },
                    {
                        'type': 'postback',
                        'title': 'Show all',
                        'payload': 'events_list'
                    }
                ]
            }
        }
    };
}

module.exports = welcomeTemplate;