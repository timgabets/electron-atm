/**
 * Parse listener handles translations from network binary message to internal application message object
 */

const electron = require('electron')
const Parser = require('../controllers/parser.js');
const Trace = require('../controllers/trace.js');
const ipc = electron.ipcRenderer

let parser = new Parser();
let trace = new Trace();

ipc.on('parse-host-message', (event, data) => {
  var parsed = parser.parseHostMessage(data);
  console.log('Host message parsed:' + trace.object(parsed));
  ipc.send('host-message-parsed', parsed);
})
