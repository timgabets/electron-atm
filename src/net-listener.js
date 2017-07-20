/**
 * Listening to Network Events (sending/receiving data from host)
 */

const electron = require('electron')
const Network = require('./network');
const ipc = electron.ipcRenderer

let network = new Network();

console.log('Hello from net listener');

ipc.on('ping', (event, message) => {
  console.log(message);
})
