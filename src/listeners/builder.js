/**
 * Builder listener handles translations from network binary message to internal application message object
 */

const electron = require('electron')
const Builder = require('../controllers/builder.js');
const ipc = electron.ipcRenderer

//TODO: pass LUNO properly
let builder = new Builder('000');

ipc.on('build-atm-response', (event, message) => {
  var data = builder.build(message);
  if(data)
    ipc.send('atm-message-built', data);
})

