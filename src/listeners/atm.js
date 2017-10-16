/**
 * ATM event listener.
 */

const CryptoService = nodeRequire('./src/services/crypto.js');

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
  settings.set('last_used_card', cardnumber)
  atm.readCard(cardnumber, track2)
})

ipc.on('atm-network-connection-established', (event) => {
  atm.setStatus('Connected');
})

ipc.on('atm-network-disconnected', (event) => {
  atm.setStatus('Offline');
})

// Updating ATM screen 
var image = ''
setInterval(function() {
  if(atm.display.getImage() !== image){
  	image = atm.display.getImage();
    if(image)
      ipc.send('atm-change-screen-image', image);
  }
}, 300);

var transaction_request = null
setInterval(function() {
  if(atm.transaction_request){
    ipc.send('build-message-to-host', atm.transaction_request);
    atm.transaction_request = null
  }
}, 300);
