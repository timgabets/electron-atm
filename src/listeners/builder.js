/**
 * Builder listener handles translations from network binary message to internal application message object
 */

const electron = require('electron')
const Builder = require('../controllers/builder.js');
const Trace = require('../controllers/trace.js');
const ipc = electron.ipcRenderer

//TODO: pass LUNO properly
let builder = new Builder('000');
let trace = new Trace();

ipc.on('build-atm-response', (event, message) => {
  var built = builder.build(message);
  if(built){
  	console.log('ATM message built:' + trace.object(message));
    ipc.send('atm-message-built', built);
  }
})

