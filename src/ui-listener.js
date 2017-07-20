/**
 * Listening to User Interface Events
 */

const electron = require('electron')
const network = require('./network.js')

const ipc = electron.ipcRenderer

document.getElementById('connect').addEventListener('click', _ => {
  ipc.send('network-connect', document.getElementById('host').value, document.getElementById('port').value);
});


document.getElementById('send-transaction-request').addEventListener('click', _ => {
  var opcode = document.getElementById('opcode-buffer').value;
  var track2 = document.getElementById('selected-card').value;
  
  var trxn_request = '11\x1C000\x1C\x1C\x1C12\x1C' + track2 + '\x1C\x1C' + opcode + '\x1C00000000\x1C4;5=72;8:?=742?;\x1C00000000000000000000000000000000\x1C00000000000000000000000000000000\x1C\x1C2005210000000000000000000000000000000000000000000000';
  ipc.send('network-send', trxn_request);
});

document.getElementById('send-ready').addEventListener('click', _ => {
  var ready = '22\x1C000\x1C\x1C9'
  ipc.send('network-send', ready);  
});

