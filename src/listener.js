const electron = require('electron')
const network = require('./network.js')

const ipc = electron.ipcRenderer

document.getElementById('connect').addEventListener('click', _ => {
  ipc.send('network-connect', document.getElementById('host').value, document.getElementById('port').value);
});

document.getElementById('send-transaction-request').addEventListener('click', _ => {
  var trxn_request = '11\x1C000\x1C\x1C\x1C12\x1C;4575270595153145=20012211998522600001?\x1C\x1CFA  G  A\x1C00000000\x1C4;5=72;8:?=742?;\x1C00000000000000000000000000000000\x1C00000000000000000000000000000000\x1C\x1C2005210000000000000000000000000000000000000000000000';
  ipc.send('network-send', trxn_request);
});

document.getElementById('send-ready').addEventListener('click', _ => {
  var ready = '22\x1C000\x1C\x1C9'
  ipc.send('network-send', ready);  
});

document.getElementById('disconnect').addEventListener('click', _ => {
  ipc.send('network-disconnect');
});
