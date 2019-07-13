const nofity = require('./notifyTemplate');
const welcome = require('./welcomeTemplate');

function notifyTemplate(event) {
  return nofity(event);
}

function welcomeTemplate() {
  return welcome();
}

module.exports = { notifyTemplate, welcomeTemplate };
