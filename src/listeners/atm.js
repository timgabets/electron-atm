/**
 * ATM event listener.
 */

const ATM = nodeRequire('./src/controllers/atm.js');

let atm = new ATM();

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