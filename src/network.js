// NodeJS net module
const net = require('net');
// trace routines
const Trace = require('./trace');

function Network() {
    /**
     * [getOutgoingMessageLength get the Message Header Length]
     * @param  {[type]} data [binary data]
     * @return {[type]}      [two-bytes length, e.g. '\x00\x0a' for 10-byte data]
     */
    this.getOutgoingMessageLength = function (data){
      return String.fromCharCode(data.length / 256) + String.fromCharCode(data.length % 256);
    };

    /**
     * [send description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    this.send = function (data){
      var binary_data = Buffer(this.getOutgoingMessageLength(data) + data, 'binary');
      this.client.write(binary_data);
      this.trace.trace(binary_data, '>> ' + binary_data.length + ' bytes sent:');
    };

    this.trace = new Trace();
    this.client = new net.Socket();

    /**
     * [network disconnect listener]
     * @param  {[type]} )  [description]
     * @return {[type]}   [description]
     */
    this.client.on('close', function() {
      //this.client.destroy();
      console.log('Connection closed');        
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

module.exports = Network
