// NodeJS net module
const net = require('net');
// trace routines
const Trace = require('./trace');

function Network() {
    this.getOutgoingMessageLength = function (data){
      // TODO: message length > 4096
      return '\x00' + String.fromCharCode(data.length);
    };

    this.send = function (data){
      var binary_data = Buffer(this.getOutgoingMessageLength(data) + data, 'binary');
      this.client.write(binary_data);
      this.trace.trace(binary_data, '>> ' + binary_data.length + ' bytes sent:');
    };

    this.trace = new Trace();
    this.client = new net.Socket();

    this.client.on('data', function(data) {
      this.trace.trace(data, '<< ' + data.length + ' bytes received:');
    });
}

/**
 * [connect description]
 * @param  {[type]} host [description]
 * @param  {[type]} port [description]
 * @return {[type]}      [description]
 */
Network.prototype.connect = function(host, port){
  this.client.connect(port, host, function() {
    console.log('Connected to ' + host + ':' + port);
  });
};

/**
 * [send description]
 * @param  {[type]} message [description]
 * @return {[type]}      [description]
 */
Network.prototype.send = function(message){
  this.send(message);
};

/**
 * [disconnect description]
 * @return {[type]} [description]
 */
Network.prototype.disconnect = function(){
  this.client.destroy();
  this.client.on('close', function() {
    console.log('Connection closed');
  });
};

module.exports = Network
