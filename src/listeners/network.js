/**
 * Listening to Network Events (sending/receiving data from host)
 */
const electron = nodeRequire('electron')
//const Log = nodeRequire('./src/controllers/log.js');
const Network = nodeRequire('./src/controllers/network.js');
const ipc = electron.ipcRenderer

//let log = new Log();
let network = new Network(ipc, log);

ipc.on('network-connect', (event, message) => {
  network.toggleConnect('127.0.0.1', 11032);
})

ipc.on('network-send', (event, message) => {
  network.send(message);
})
