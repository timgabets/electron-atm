/**
 * ATM event listener.
 */

const electron = require('electron')
const ATM = require('../atm.js');
const ipc = electron.ipcRenderer

let atm = new ATM();

ipc.on('atm-process-host-message', (event, message) => {
  atm.processHostMessage(message)
})

ipc.on('atm-process-button-pressed', (event, button) => {
  atm.processButtonPressed(button)
})
