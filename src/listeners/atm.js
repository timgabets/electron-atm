/**
 * ATM event listener.
 */

const ATM = require('./src/controllers/atm.js');
const CryptoService = require('./src/services/crypto.js');
const settings = require('electron-settings');

let atm = new ATM(settings, log);
let crypto = new CryptoService(settings, log);

ipc.on('atm-process-host-message', (event, message) => {
  var response_message = atm.processHostMessage(message);
  if (response_message) {
    ipc.send('build-message-to-host', response_message);
  }
})

ipc.on('atm-process-fdk-pressed', (event, button) => {
  atm.processFDKButtonPressed(button)
})

ipc.on('atm-process-pinpad-button-pressed', (event, button) => {
  atm.processPinpadButtonPressed(button)
})

ipc.on('atm-read-card', (event, cardnumber, track2) => {
  atm.readCard(cardnumber, track2)
})

// Updating ATM screen 
var current_screen = {}
setInterval(function() {
  if(atm.current_screen != current_screen){
  	current_screen = atm.current_screen;
    ipc.send('atm-change-screen-image', atm.current_screen.image_file);
  }
}, 300);

var transaction_request = null
setInterval(function() {
  if(atm.transaction_request){
    ipc.send('build-message-to-host', atm.transaction_request);
    atm.transaction_request = null
  }
}, 300);
