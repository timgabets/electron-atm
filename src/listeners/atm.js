/**
 * ATM event listener.
 */

const ATM = require('./src/controllers/atm.js');
const settings = require('electron-settings');

let atm = new ATM(settings);

ipc.on('atm-process-host-message', (event, message) => {
  var response_message = atm.processHostMessage(message);
  if (response_message) {
    ipc.send('build-atm-response', response_message);
  }
})

ipc.on('atm-process-button-pressed', (event, button) => {
  atm.processButtonPressed(button)
})

ipc.on('atm-read-card', (event, card_data) => {
  atm.readCard(card_data)
})