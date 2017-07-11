const electron = require('electron')
const network = require('./network.js')

const ipc = electron.ipcRenderer

document.getElementById('connect').addEventListener('click', _ => {
  //ipc.send('network-connect');
  //
  let host = document.getElementById('host').value;
  let port = document.getElementById('port').value;
  network.connect(host, port);
});

document.getElementById('send-transaction-request').addEventListener('click', _ => {
  //ipc.send('network-send');
  var trxn = '11\x1C000\x1C\x1C\x1C12\x1C;4575270595153145=20012211998522600001?\x1C\x1CFA  G  A\x1C00000000\x1C4;5=72;8:?=742?;\x1C00000000000000000000000000000000\x1C00000000000000000000000000000000\x1C\x1C2005210000000000000000000000000000000000000000000000';
  network.send(trxn);
});

document.getElementById('send-ready').addEventListener('click', _ => {
  //ipc.send('network-send');
  var ready = '22\x1C000\x1C\x1C9'
  network.send(ready);
});

document.getElementById('disconnect').addEventListener('click', _ => {
  //ipc.send('network-disconnect');
  network.disconnect();
});
