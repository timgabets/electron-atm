// NodeJS net module
const net = require('net');
// trace routines
const trace = require('./trace');

let host = '127.0.0.1';
let port = 11032;
let client = new net.Socket()
client = new net.Socket();

/**
 * [getMessageLength description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function _getMessageLength(data){
  // TODO: message length > 4096
  return '\x00' + String.fromCharCode(data.length);
};

/**
 * [send description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function _send(data){
  var binary_data = Buffer(_getMessageLength(data) + data, 'binary');
  client.write(binary_data);
  trace.trace(binary_data, '>> ' + binary_data.length + ' bytes sent:');
};

/*
 Hadling incoming messages from the host
 */
client.on('data', function(data) {
  trace.trace(data, '<< ' + data.length + ' bytes received:');
});

/**
 * [connect description]
 * @return {[type]} [description]
 */
exports.connect = function(host, port){
  client.connect(port, host, function() {
    console.log('Connected to ' + host + ':' + port);
  });
};

/**
 * [send description]
 * @return {[type]} [description]
 */
exports.send = function(data){
  _send(data);
};

/**
 * [disconnect description]
 * @return {[type]} [description]
 */
exports.disconnect = function(){
  client.destroy();
  client.on('close', function() {
    console.log('Connection closed');
  });
};
