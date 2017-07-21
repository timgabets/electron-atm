/**
 * ATM event listener.
 */

const electron = require('electron')
const ATM = require('../controllers/atm.js');
const ipc = electron.ipcRenderer

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
