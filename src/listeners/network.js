/**
 * Listening to Network Events (sending/receiving data from host)
 */
const electron = nodeRequire('electron')
const Log = nodeRequire('atm-logging');
const Network = nodeRequire('./src/controllers/network.js');
const ipc = electron.ipcRenderer

let log = new Log();
let network = new Network(ipc, log);

ipc.on('network-connect', (event, connection_settings) => {
  network.toggleConnect(connection_settings.ip, connection_settings.port);
})

ipc.on('network-send', (event, message) => {
  network.send(message);
})
