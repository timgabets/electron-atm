/**
 * Listening to Network Events (sending/receiving data from host)
 */
const electron = require('electron')
const Log = require('./src/controllers/log.js');
const Network = require('./src/controllers/network.js');
const ipc = electron.ipcRenderer

let log = new Log();
let network = new Network(log);

ipc.on('network-connect', (event, message) => {
  
  network.connect('127.0.0.1', 11032);

  network.client.on('connect', data => {
    ipc.send('network-connection-established');

    // Listening to socket
    network.client.on('data', data => {
      network.trace.trace(data, '<< ' + data.length + ' bytes received:');
      ipc.send('network-data-received', data);
    });

    network.client.on('close', _ => {
      network.client.destroy();
      if(network.isConnected){
        ipc.send('network-disconnected');
        log.warn('Connection closed');
      }
      
      network.isConnected = false;
    });
  });

})

ipc.on('network-send', (event, message) => {
  network.send(message);
})
