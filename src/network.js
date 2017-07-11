// NodeJS net module
const net = require('net');
// trace routines
const trace = require('./trace');

let client = new net.Socket()
client = new net.Socket();
var host = '127.0.0.1';
var port = 11032;

exports.connect = function(){
  client.connect(port, host, function() {
    console.log('Connected to ' + host + ':' + port);
  });
};

exports.send = function(){
  function getMessageLength(data){
    // TODO: message length > 4096
    return '\x00' + String.fromCharCode(data.length);
  };

  function send(data){
    var binary_data = Buffer(getMessageLength(data) + data, 'binary');
    client.write(binary_data);
    trace.trace(binary_data, '>> ' + binary_data.length + ' bytes sent:');
  };

  var data = '11\x1C000\x1C\x1C\x1C12\x1C;4575270595153145=20012211998522600001?\x1C\x1CFA  G  A\x1C00000000\x1C4;5=72;8:?=742?;\x1C00000000000000000000000000000000\x1C00000000000000000000000000000000\x1C\x1C2005210000000000000000000000000000000000000000000000';
  //var data = '22\x1C000\x1C\x1C9'
  send(data);

  client.on('data', function(data) {
    trace.trace(data, '<< ' + data.length + ' bytes received:');
  });
};

exports.disconnect = function(){
  client.destroy();
  client.on('close', function() {
    console.log('Connection closed');
  });
};