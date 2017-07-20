/**
 * Parse listener, handling translations from network binary message to internal application message object (and vice versa)
 */

const electron = require('electron')
const Parser = require('../parser.js');
const Trace = require('../trace.js');
const ipc = electron.ipcRenderer

let parser = new Parser();
let trace = new Trace();

ipc.on('parse-host-message', (event, data) => {
  ipc.send('host-message-parsed', parser.parseHostMessage(data));
})

