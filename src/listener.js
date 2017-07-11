const electron = require('electron')
const net = require('net');
const trace = require('./trace');

const ipc = electron.ipcRenderer

document.getElementById('connect').addEventListener('click', _ => {
  //ipc.send('network-connect');
  console.log('network-connect');

    var client = new net.Socket();
    var host = '127.0.0.1';
    var port = 11032;

    function getMessageLength(data){
      // TODO: message length > 4096
      return '\x00' + String.fromCharCode(data.length);
    };

    function send(data){
      var binary_data = Buffer(getMessageLength(data) + data, 'binary');
      client.write(binary_data);
      trace.trace(binary_data, '>> ' + binary_data.length + ' bytes sent:');
    };

    client.connect(port, host, function() {
      console.log('Connected to ' + host + ':' + port);
    });

    var data = '11\x1C000\x1C\x1C\x1C12\x1C;4575270595153145=20012211998522600001?\x1C\x1CFA  G  A\x1C00000000\x1C4;5=72;8:?=742?;\x1C00000000000000000000000000000000\x1C00000000000000000000000000000000\x1C\x1C2005210000000000000000000000000000000000000000000000';
    //var data = '22\x1C000\x1C\x1C9'
    send(data);

    client.on('data', function(data) {
      trace.trace(data, '<< ' + data.length + ' bytes received:');
      client.destroy();
    });

    client.on('close', function() {
      console.log('Connection closed');
    });
});

document.getElementById('disconnect').addEventListener('click', _ => {
  //ipc.send('network-disconnect');
  console.log('network-disconnect');
});

document.getElementById('send').addEventListener('click', _ => {
  //ipc.send('network-send');
  console.log('network-send');
});
